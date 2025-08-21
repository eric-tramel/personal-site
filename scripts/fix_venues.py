#!/usr/bin/env python3
"""
Fix Publication Venues Script
Updates venue information for publications that show "No venue" or "Unknown Venue"
"""

import json
import re
from pathlib import Path
from scholarly import scholarly

def fix_venue_info():
    """Fix venue information in the publications JSON"""
    with open('publications_data.json', 'r') as f:
        data = json.load(f)
    
    print(f"Checking venue info for {len(data['publications'])} publications...")
    
    for i, pub in enumerate(data['publications']):
        if pub.get('venue') in ['No venue', 'Unknown Venue', '']:
            print(f"\nFixing venue for: {pub['title'][:60]}...")
            
            try:
                # Search for the specific publication
                search_query = f'"{pub["title"]}" author:"{pub["authors"].split(" and ")[0]}"'
                search_results = scholarly.search_pubs(search_query)
                
                # Get the first result and fill details
                result = next(search_results, None)
                if result:
                    detailed = scholarly.fill(result)
                    bib = detailed.get('bib', {})
                    
                    # Try multiple venue fields
                    new_venue = (bib.get('venue') or 
                                bib.get('journal') or 
                                bib.get('booktitle') or 
                                bib.get('publisher') or
                                bib.get('eprint') or
                                'Unknown Venue')
                    
                    if new_venue != 'Unknown Venue':
                        pub['venue'] = new_venue
                        print(f"  Found venue: {new_venue}")
                    else:
                        print(f"  Still no venue found")
                        # Print all available bib fields for debugging
                        print(f"  Available fields: {list(bib.keys())}")
                else:
                    print(f"  No search results found")
                    
            except Exception as e:
                print(f"  Error: {e}")
    
    # Save updated data
    with open('publications_data.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Updated venue information saved to publications_data.json")

if __name__ == "__main__":
    fix_venue_info()