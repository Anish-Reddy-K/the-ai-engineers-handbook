import os
import re
import shutil
import urllib.parse
from dotenv import load_dotenv

load_dotenv()

hugo_posts_dir = os.getenv("HUGO_POSTS_DIR")
attachments_dir = os.getenv("ATTACHMENTS_DIR")
static_images_dir = os.getenv("STATIC_IMAGES_DIR")

os.makedirs(static_images_dir, exist_ok=True)

# match OBSIDIAN image embeds: optional !, [[filename.ext]] optionally with an alias [[file|alt]]
pattern = re.compile(r'!?\[\[([^\]\|]+?\.(?:png|jpg|jpeg|gif|svg))(?:\|([^\]]+))?\]\]', re.IGNORECASE)

copied = 0
missing = []
referenced_images = set()  # track images referenced in markdown files
attachments_images = set()  # track images that exist in attachments directory

# first pass: collect all referenced images and images in attachments
for root, _, files in os.walk(hugo_posts_dir):
    for fname in files:
        if not fname.lower().endswith(".md"):
            continue
        path = os.path.join(root, fname)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Find all image references
        for m in pattern.finditer(content):
            img_path = m.group(1)
            basename = os.path.basename(img_path)
            referenced_images.add(basename.lower())

# collect images that exist in attachments directory
if os.path.exists(attachments_dir):
    for root, _, files in os.walk(attachments_dir):
        for fname in files:
            if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
                attachments_images.add(fname.lower())

# second pass: process markdown files and copy images
for root, _, files in os.walk(hugo_posts_dir):
    for fname in files:
        if not fname.lower().endswith(".md"):
            continue
        path = os.path.join(root, fname)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()

        def repl(m):
            img_path = m.group(1)  # may include subpath or just basename
            alias = m.group(2)
            basename = os.path.basename(img_path)
            # copy image from attachments (try exact path then basename)
            src = os.path.join(attachments_dir, img_path)
            if not os.path.exists(src):
                src = os.path.join(attachments_dir, basename)
            if not os.path.exists(src):
                missing.append(img_path)
            else:
                dest = os.path.join(static_images_dir, basename)
                try:
                    os.makedirs(os.path.dirname(dest), exist_ok=True)
                    shutil.copy2(src, dest)
                    copied += 1
                except Exception:
                    pass

            alt = alias if alias else os.path.splitext(basename)[0]
            url = "/images/" + urllib.parse.quote(basename)
            return f'![{alt}]({url})'

        new_content = pattern.sub(repl, content)
        if new_content != content:
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_content)

# clean up: delete images from static/images that are no longer referenced or don't exist in attachments
deleted = 0
if os.path.exists(static_images_dir):
    for fname in os.listdir(static_images_dir):
        if fname.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.svg')):
            fname_lower = fname.lower()
            # delete if image is not referenced in markdown OR doesn't exist in attachments
            if fname_lower not in referenced_images or fname_lower not in attachments_images:
                file_path = os.path.join(static_images_dir, fname)
                try:
                    os.remove(file_path)
                    deleted += 1
                except Exception as e:
                    print(f"Error deleting {fname}: {e}")

print(f"images copied: {copied}")
if deleted > 0:
    print(f"images deleted: {deleted}")
if missing:
    print("missing in attachments (not copied):", ", ".join(sorted(set(missing))))