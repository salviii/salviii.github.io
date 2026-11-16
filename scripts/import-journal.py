#!/usr/bin/env python3
"""Merge reviewed Instagram entries with locally saved images into the journal.

Usage: python3 scripts/import-journal.py /path/to/entries.json [--write]
Input: a JSON list using date, body, images, songs, and source_url fields.
Dates use 'November 14, 2026'; songs use [{"title": "...", "artist": "..."}].
Images must already exist inside this repository. Default is a dry run.
"""
import argparse
import json
import re
from datetime import datetime
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', type=Path)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    root = Path(__file__).resolve().parent.parent
    target = root / 'journal.json'
    journal = json.loads(target.read_text())
    incoming = json.loads(args.input.read_text())
    if not isinstance(incoming, list):
        raise ValueError('Input must be a list of reviewed entries')

    # Freeze legacy links before prepending entries changes their array indexes.
    for index, entry in enumerate(journal['entries']):
        entry.setdefault('id', f'post-{index}')
    known = {entry['id'] for entry in journal['entries']}
    added = []
    for entry in incoming:
        match = re.fullmatch(
            r'https://www\.instagram\.com/(?:salvabikes/)?(?:p|reel)/([\w-]+)/',
            entry['source_url'])
        if not match:
            raise ValueError(f"Invalid Instagram post URL: {entry['source_url']}")
        entry['id'] = 'instagram-' + match[1]
        if entry['id'] in known:
            continue
        datetime.strptime(entry['date'], '%B %d, %Y')
        if not isinstance(entry['body'], str):
            raise ValueError('Caption must be a string')
        if not entry['images']:
            raise ValueError(f"No saved photo for {entry['id']}")
        for image in entry['images']:
            path = (root / image).resolve()
            if not path.is_relative_to(root) or not path.is_file():
                raise ValueError(f'Missing or invalid image: {image}')
        if not isinstance(entry['songs'], list):
            raise ValueError('Songs must be a list (empty when no song is attached)')
        for song in entry['songs']:
            if not song.get('title') or not song.get('artist'):
                raise ValueError(f"Incomplete song for {entry['id']}")
        if entry.get('page') is not None:
            raise ValueError('Instagram entries must not use document page numbers')
        known.add(entry['id'])
        added.append(entry)

    added.sort(key=lambda entry: datetime.strptime(entry['date'], '%B %d, %Y'), reverse=True)
    journal['entries'] = added + journal['entries']
    journal['total_entries'] = len(journal['entries'])
    dates = [datetime.strptime(entry['date'], '%B %d, %Y') for entry in journal['entries']]
    journal['date_range'] = f'{min(dates):%B} {min(dates).day}, {min(dates).year} – {max(dates):%B} {max(dates).day}, {max(dates).year}'
    print(f"{'Writing' if args.write else 'Dry run:'} {len(added)} new entries; {journal['total_entries']} total")
    if args.write and added:
        temporary = target.with_suffix('.json.tmp')
        temporary.write_text(json.dumps(journal, ensure_ascii=False, indent=2) + '\n')
        temporary.replace(target)


if __name__ == '__main__':
    main()
