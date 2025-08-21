#!/usr/bin/env python3
"""
Debug Venue Extraction
Check what fields are actually available from scholarly for venue information
"""

from scholarly import scholarly
import json

def debug_publication_fields():
    """Debug what fields are available for publications"""
    scholar_id = "jre2iwMAAAAJ"
    
    try:
        print("Fetching author info...")
        author = scholarly.search_author_id(scholar_id)
        author_info = scholarly.fill(author)
        
        print(f"Found: {author_info['name']}")
        print(f"Total publications: {len(author_info['publications'])}")
        
        # Get detailed info for first few publications to debug
        for i, pub in enumerate(author_info['publications'][:3]):
            print(f"\n=== Publication {i+1} ===")
            print(f"Title: {pub.get('bib', {}).get('title', 'No title')}")
            
            print("Before fill():")
            print(f"  Available keys: {list(pub.keys())}")
            if 'bib' in pub:
                print(f"  Bib keys: {list(pub['bib'].keys())}")
                for key, value in pub['bib'].items():
                    print(f"    {key}: {value}")
            
            # Fill with detailed info
            detailed = scholarly.fill(pub)
            
            print("After fill():")
            print(f"  Available keys: {list(detailed.keys())}")
            if 'bib' in detailed:
                print(f"  Bib keys: {list(detailed['bib'].keys())}")
                for key, value in detailed['bib'].items():
                    print(f"    {key}: {value}")
            
            # Check for venue in any field
            venue_candidates = [
                detailed.get('bib', {}).get('venue'),
                detailed.get('bib', {}).get('journal'), 
                detailed.get('bib', {}).get('booktitle'),
                detailed.get('bib', {}).get('publisher'),
                detailed.get('source'),
                detailed.get('venue'),
                detailed.get('journal')
            ]
            
            print(f"  Venue candidates: {[v for v in venue_candidates if v]}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    debug_publication_fields()