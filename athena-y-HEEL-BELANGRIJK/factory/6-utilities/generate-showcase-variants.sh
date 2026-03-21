#!/bin/bash
# 🚀 Athena Showcase Variant Generator
# Generates multiple themed versions of a site for the portfolio.

SOURCE_SITE=$1
if [ -z "$SOURCE_SITE" ]; then
    echo "❌ Usage: ./generate-showcase-variants.sh <site-name>"
    exit 1
fi

SITES_DIR="athena-y/sites"
THEMES=("classic.css" "modern-dark.css" "bold.css" "warm.css")

for theme in "${THEMES[@]}"; do
    theme_name=$(echo $theme | cut -d'.' -f1)
    target_site="${SOURCE_SITE}-${theme_name}"
    
    echo "🎨 Generating variant: $target_site (Theme: $theme)..."
    
    # 1. Copy source
    cp -r "$SITES_DIR/$SOURCE_SITE" "$SITES_DIR/$target_site"
    
    # 2. Remove .git if exists
    rm -rf "$SITES_DIR/$target_site/.git"
    
    # 3. Update athena-config.json
    config_path="$SITES_DIR/$target_site/athena-config.json"
    if [ -f "$config_path" ]; then
        sed -i "s/\"styleName\": \".*\"/\"styleName\": \"$theme\"/" "$config_path"
        sed -i "s/\"projectName\": \".*\"/\"projectName\": \"$target_site\"/" "$config_path"
    fi
    
    # 4. Add to git
    git add "$SITES_DIR/$target_site"
done

echo "💾 Committing showcase variants..."
git commit -m "🚀 SHOWCASE: Added themed variants for $SOURCE_SITE"
git push origin main
