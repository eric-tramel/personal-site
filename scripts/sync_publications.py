#!/usr/bin/env python3
"""
Google Scholar Publications Sync Script
Fetches publications from Google Scholar and formats them for Jekyll site
"""

import json
import sys
from scholarly import scholarly

def fetch_publications(scholar_id, max_publications=None):
    """Fetch publications from Google Scholar profile
    
    Args:
        scholar_id: Google Scholar user ID
        max_publications: Maximum number of publications to fetch (None for all)
    """
    print(f"Fetching publications for user: {scholar_id}")
    if max_publications:
        print(f"Limiting to first {max_publications} publications")
    
    try:
        # Search for author by ID
        author = scholarly.search_author_id(scholar_id)
        author_info = scholarly.fill(author)
        
        print(f"Found: {author_info['name']}")
        print(f"Affiliation: {author_info.get('affiliation', 'N/A')}")
        print(f"Publications: {len(author_info['publications'])}")
        print("-" * 60)
        
        # Fetch detailed info for publications
        publications = []
        total_pubs = len(author_info['publications'])
        
        # Determine how many publications to fetch
        if max_publications:
            pubs_to_fetch = min(max_publications, total_pubs)
            print(f"Fetching detailed info for first {pubs_to_fetch} of {total_pubs} publications...")
        else:
            pubs_to_fetch = total_pubs
            print(f"Fetching detailed info for all {total_pubs} publications...")
        
        for i, pub in enumerate(author_info['publications'][:pubs_to_fetch]):
            print(f"Fetching publication {i+1}...")
            detailed_pub = scholarly.fill(pub)
            
            bib = detailed_pub.get('bib', {})
            
            # Try multiple fields for venue information
            venue = (bib.get('venue') or 
                    bib.get('journal') or 
                    bib.get('conference') or 
                    bib.get('booktitle') or 
                    bib.get('publisher') or
                    detailed_pub.get('source', '') or
                    'Unknown Venue')
            
            # Handle the special AUTHOR_PUBLICATION_ENTRY case
            if str(venue) == "PublicationSource.AUTHOR_PUBLICATION_ENTRY" or str(venue) == "AUTHOR_PUBLICATION_ENTRY":
                # Try other fields
                venue = (bib.get('journal') or 
                        bib.get('conference') or 
                        bib.get('booktitle') or 
                        bib.get('publisher') or
                        'Unknown Venue')
            
            pub_data = {
                'title': bib.get('title', 'No title'),
                'authors': bib.get('author', 'No authors'),
                'venue': venue,
                'year': bib.get('pub_year', 'No year'),
                'citation_count': detailed_pub.get('num_citations', 0),
                'url': detailed_pub.get('pub_url', ''),
                'abstract': bib.get('abstract', ''),
                'scholar_id': detailed_pub.get('author_pub_id', '')
            }
            publications.append(pub_data)
            
            # Print summary
            print(f"{i+1:2d}. {pub_data['title']} ({pub_data['year']}) - {pub_data['citation_count']} citations")
            print(f"    Venue: {pub_data['venue']}")
        
        # Save to JSON for processing
        with open('publications_data.json', 'w') as f:
            json.dump({
                'author': author_info['name'],
                'publications': publications,
                'total_found': total_pubs,
                'fetched_at': str(author_info.get('citedby', 'Unknown'))
            }, f, indent=2)
        
        print("-" * 60)
        print(f"✓ Saved {len(publications)} publications to publications_data.json")
        if len(publications) < total_pubs:
            print(f"  Note: Fetched {len(publications)} out of {total_pubs} total publications")
        
        return publications
        
    except Exception as e:
        print(f"Error fetching publications: {e}")
        return []

if __name__ == "__main__":
    import sys
    scholar_id = "jre2iwMAAAAJ"  # Eric Tramel's Google Scholar ID
    
    # Check for command line argument to limit publications
    max_pubs = None
    if len(sys.argv) > 1:
        try:
            max_pubs = int(sys.argv[1])
            print(f"Limiting to {max_pubs} publications as requested")
        except ValueError:
            print("Invalid number provided, fetching all publications")
    
    publications = fetch_publications(scholar_id, max_pubs)