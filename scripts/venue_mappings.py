#!/usr/bin/env python3
"""
Venue Mappings
Manual mappings for common publications that don't get venue info from scholarly
"""

# Known venue mappings based on common patterns
VENUE_MAPPINGS = {
    "compressed-sensing recovery of images and video using multihypothesis predictions": "Foundations and Trends® in Signal Processing",
    "block-based compressed sensing of images and video": "Foundations and Trends® in Signal Processing",
    "nearest regularized subspace for hyperspectral classification": "IEEE Transactions on Geoscience and Remote Sensing",
    "multiscale block compressed sensing with smoothed projected landweber reconstruction": "Proceedings of EUSIPCO",
    "federated learning for predicting histological response to neoadjuvant chemotherapy in triple-negative breast cancer": "Nature Medicine",
    "siloed federated learning for multi-centric histopathology datasets": "MICCAI 2020",
    "classification and disease localization in histopathology using only global labels": "arXiv preprint",
    "video compressed sensing with multihypothesis": "Proceedings of Data Compression Conference",
    "spectral–spatial preprocessing using multihypothesis prediction for noise-robust hyperspectral image classification": "IEEE Journal of Selected Topics in Applied Earth Observations and Remote Sensing",
    "federated learning challenges and opportunities: an outlook": "IEEE Transactions on Signal Processing",
    "swept approximate message passing for sparse estimation": "Proceedings of ICML",
    "training restricted boltzmann machine via the thouless-anderson-palmer free energy": "Advances in Neural Information Processing Systems",
    "variational free energies for compressed sensing": "Proceedings of ISIT",
    "reconstruction of hyperspectral imagery from random projections using multihypothesis prediction": "IEEE Transactions on Geoscience and Remote Sensing",
    "statistical physics, optimization, inference, and message-passing algorithms": "Oxford University Press",
    "deterministic and generalized framework for unsupervised learning with restricted boltzmann machines": "Physical Review X",
    "intensity-only optical compressive imaging using a multiply scattering material": "Proceedings of ICASSP",
    "compressed-sensing recovery of multiview image and video sequences using signal prediction": "Proceedings of EUSIPCO",
    "approximate message passing with restricted boltzmann machine priors": "Journal of Statistical Mechanics",
    "efficient sparse secure aggregation for federated learning": "arXiv preprint"
}

def apply_venue_mappings():
    """Apply manual venue mappings to publications data"""
    import json
    import re
    
    with open('publications_data.json', 'r') as f:
        data = json.load(f)
    
    updated_count = 0
    for pub in data['publications']:
        # Normalize title for lookup
        title_key = re.sub(r'[^\w\s]', '', pub['title'].lower()).strip()
        title_key = re.sub(r'\s+', ' ', title_key)
        
        if title_key in VENUE_MAPPINGS:
            old_venue = pub.get('venue', 'No venue')
            if old_venue in ['No venue', 'Unknown Venue', '']:
                pub['venue'] = VENUE_MAPPINGS[title_key]
                print(f"Updated: {pub['title'][:50]}...")
                print(f"  Venue: {pub['venue']}")
                updated_count += 1
    
    # Save updated data
    with open('publications_data.json', 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"\n✓ Updated {updated_count} publication venues")

if __name__ == "__main__":
    apply_venue_mappings()