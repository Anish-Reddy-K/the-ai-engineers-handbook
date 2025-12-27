#!/usr/bin/env python3
"""
Script to rename markdown files to match their frontmatter slug.
Excludes _index.md files.
"""

import os
import re
from pathlib import Path

def extract_slug_from_frontmatter(file_path):
    """Extract slug from YAML frontmatter."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Match YAML frontmatter (between --- markers)
        frontmatter_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
        if not frontmatter_match:
            return None
        
        frontmatter = frontmatter_match.group(1)
        
        # Extract slug field
        slug_match = re.search(r'^slug:\s*["\']?([^"\'\n]+)["\']?', frontmatter, re.MULTILINE)
        if slug_match:
            return slug_match.group(1).strip()
        
        return None
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return None

def rename_files_in_directory(content_dir):
    """Rename all markdown files in content directory to match their slugs."""
    content_path = Path(content_dir)
    
    if not content_path.exists():
        print(f"Error: Directory {content_dir} does not exist")
        return
    
    renamed_count = 0
    skipped_count = 0
    error_count = 0
    
    # Walk through all chapter directories
    for chapter_dir in content_path.iterdir():
        if not chapter_dir.is_dir():
            continue
        
        print(f"\nProcessing chapter: {chapter_dir.name}")
        
        # Process all markdown files in the chapter
        for md_file in chapter_dir.glob("*.md"):
            # Skip _index.md files
            if md_file.name == "_index.md":
                continue
            
            # Extract slug
            slug = extract_slug_from_frontmatter(md_file)
            
            if not slug:
                print(f"  ⚠️  Skipping {md_file.name}: No slug found in frontmatter")
                skipped_count += 1
                continue
            
            # Determine new filename
            new_filename = f"{slug}.md"
            new_path = md_file.parent / new_filename
            
            # Skip if already correctly named
            if md_file.name == new_filename:
                print(f"  ✓  {md_file.name} already correctly named")
                continue
            
            # Check if target file already exists (different file with same slug)
            if new_path.exists() and new_path != md_file:
                print(f"  ⚠️  Skipping {md_file.name}: Target {new_filename} already exists")
                skipped_count += 1
                continue
            
            # Rename the file
            try:
                md_file.rename(new_path)
                print(f"  ✓  Renamed: {md_file.name} → {new_filename}")
                renamed_count += 1
            except Exception as e:
                print(f"  ✗  Error renaming {md_file.name}: {e}")
                error_count += 1
    
    # Summary
    print("\n" + "="*60)
    print("Summary:")
    print(f"  Renamed: {renamed_count}")
    print(f"  Skipped: {skipped_count}")
    print(f"  Errors:  {error_count}")
    print("="*60)

if __name__ == "__main__":
    # Get the script directory and find content directory
    script_dir = Path(__file__).parent
    content_dir = script_dir / "content"
    
    print("Renaming markdown files to match their frontmatter slugs...")
    print(f"Content directory: {content_dir}")
    
    rename_files_in_directory(content_dir)

