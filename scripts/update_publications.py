#!/usr/bin/env python3
"""
Update Publications Script
Compares scraped Google Scholar data with existing Jekyll publications
and creates new publication files for any missing entries
"""

import json
import os
import re
from pathlib import Path
import unicodedata

def slugify(text):
    """Convert text to URL-friendly slug"""
    # Remove unicode characters and normalize
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    # Convert to lowercase and replace spaces/special chars with hyphens
    text = re.sub(r'[^a-zA-Z0-9\s\-_]', '', text).strip().lower()
    text = re.sub(r'[-\s]+', '-', text)
    return text[:50]  # Limit length

def extract_existing_titles():
    """Extract titles from existing publication files"""
    pub_dir = Path("src/_posts/publications")
    existing_titles = set()
    
    if not pub_dir.exists():
        print("No publications directory found")
        return existing_titles
    
    for pub_file in pub_dir.glob("*.markdown"):
        try:
            with open(pub_file, 'r', encoding='utf-8') as f:
                content = f.read()
                # Extract title from frontmatter
                if content.startswith('---'):
                    frontmatter = content.split('---')[1]
                    for line in frontmatter.split('\n'):
                        if line.strip().startswith('title:'):
                            title = line.split('title:')[1].strip().strip('"')
                            # Normalize title for comparison (remove punctuation, case insensitive)
                            normalized = re.sub(r'[^\w\s]', '', title.lower()).strip()
                            existing_titles.add(normalized)
                            break
        except Exception as e:
            print(f"Error reading {pub_file}: {e}")
    
    return existing_titles

def create_publication_file(pub_data, index):
    """Create a new Jekyll publication file"""
    title = pub_data['title']
    slug = slugify(title)
    
    # Create filename with index to ensure uniqueness
    filename = f"0000-01-01-{slug}-{index:02d}.markdown"
    filepath = Path(f"src/_posts/publications/{filename}")
    
    # Determine publication type based on venue
    venue = pub_data.get('venue', '').lower()
    if 'conference' in venue or 'proceedings' in venue or 'workshop' in venue:
        pubtype = 'conference'
    elif 'journal' in venue or 'transactions' in venue:
        pubtype = 'article'
    elif 'arxiv' in venue or 'preprint' in venue:
        pubtype = 'preprint'
    elif 'talk' in venue or 'presentation' in venue:
        pubtype = 'talk'
    else:
        pubtype = 'article'  # Default
    
    # Create tags based on title and venue
    tags = ['publication']
    title_lower = title.lower()
    if 'compress' in title_lower or 'sensing' in title_lower:
        tags.append('compressed sensing')
    if 'federated' in title_lower or 'learning' in title_lower:
        tags.append('machine learning')
    if 'image' in title_lower or 'video' in title_lower:
        tags.append('image processing')
    if 'sparse' in title_lower:
        tags.append('sparse reconstruction')
    
    # Format authors - try to match existing format
    authors = pub_data.get('authors', '')
    # Convert "Eric W Tramel and James E Fowler" to "E. W. Tramel & J. E. Fowler" 
    authors_formatted = authors.replace(' and ', ' & ')
    
    # Create the Jekyll frontmatter
    frontmatter = f"""---
title: "{title}"
layout: publication
category: publication
pubtype: {pubtype}
date: {pub_data.get('year', '2024')}-01-01
tag:"""
    
    for tag in tags:
        frontmatter += f"\n    - {tag}"
    
    frontmatter += f"""
authors: "{authors_formatted}"
in: "{pub_data.get('venue', 'Unknown Venue')}"
year: {pub_data.get('year', '2024')}"""
    
    # Add URL if available
    if pub_data.get('url'):
        frontmatter += f"\nlink: \"{pub_data['url']}\""
    
    # Add abstract if available and not too long
    abstract = pub_data.get('abstract', '')
    if abstract and len(abstract) < 1000:
        # Clean up abstract - remove extra whitespace and truncation markers
        abstract = re.sub(r'\s+', ' ', abstract.strip())
        abstract = abstract.replace('…', '').strip()
        frontmatter += f"\nabstract: >\n    {abstract}"
    
    frontmatter += "\n---\n"
    
    # Write the file
    os.makedirs(filepath.parent, exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(frontmatter)
    
    return filepath

def main():
    """Main function to update publications"""
    # Load scraped data
    if not os.path.exists('publications_data.json'):
        print("Error: publications_data.json not found. Run 'make scholar-sync' first.")
        return
    
    with open('publications_data.json', 'r') as f:
        data = json.load(f)
    
    scraped_pubs = data['publications']
    print(f"Loaded {len(scraped_pubs)} scraped publications")
    
    # Get existing titles
    existing_titles = extract_existing_titles()
    print(f"Found {len(existing_titles)} existing publications")
    
    # Find new publications (check for duplicates more carefully)
    new_publications = []
    for pub in scraped_pubs:
        # Normalize title for comparison
        title_normalized = re.sub(r'[^\w\s]', '', pub['title'].lower()).strip()
        
        if title_normalized not in existing_titles:
            # Also check if this title is already in our new_publications list
            is_duplicate = False
            for existing_new in new_publications:
                existing_normalized = re.sub(r'[^\w\s]', '', existing_new['title'].lower()).strip()
                if title_normalized == existing_normalized:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                new_publications.append(pub)
            else:
                print(f"Skipping duplicate: {pub['title']}")
        else:
            print(f"Already exists: {pub['title']}")
    
    print(f"Found {len(new_publications)} new publications to add")
    
    if not new_publications:
        print("✓ All publications are up to date!")
        return
    
    # Create new publication files
    created_files = []
    for i, pub in enumerate(new_publications):
        try:
            filepath = create_publication_file(pub, i + 1)
            created_files.append(filepath)
            print(f"✓ Created: {filepath.name}")
            print(f"   Title: {pub['title']}")
            print(f"   Year: {pub['year']}, Citations: {pub['citation_count']}")
            print()
        except Exception as e:
            print(f"✗ Error creating file for '{pub['title']}': {e}")
    
    print(f"✓ Successfully created {len(created_files)} new publication files")
    
    if created_files:
        print("\nNew publication files created:")
        for filepath in created_files:
            print(f"  - {filepath}")

if __name__ == "__main__":
    main()