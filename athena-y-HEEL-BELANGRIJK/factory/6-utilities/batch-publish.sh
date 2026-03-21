#!/bin/bash
# 🚀 Athena Batch Publisher
# Pushes all local sites to the athena-y-factory organization.

# Ensure we are in the project root
if [ ! -d "athena-y/sites" ]; then
    echo "❌ Error: Must be run from project root"
    exit 1
fi

SITES_DIR="athena-y/sites"

# Clean up git index first to avoid submodule issues
echo "🧹 Cleaning git index..."
git rm -r --cached athena-y/sites/*/ 2>/dev/null || true

for site in $(ls $SITES_DIR); do
    if [ -d "$SITES_DIR/$site" ]; then
        echo "📦 Processing $site..."
        
        # Remove nested .git if it exists
        if [ -d "$SITES_DIR/$site/.git" ]; then
            # Use safe removal via temporary move
            mkdir -p /tmp/athena-git-cleanup
            mv "$SITES_DIR/$site/.git" "/tmp/athena-git-cleanup/${site}-git"
        fi
        
        # Add a small dummy change to trigger the workflow
        echo "Batch build $(date)" >> "$SITES_DIR/$site/README.md"
        git add "$SITES_DIR/$site"
    fi
done

echo "💾 Committing changes..."
git commit -m "🚀 BATCH: Publish all sites to athena-y-factory organization"
echo "🛰️ Pushing to monorepo..."
git push origin main
