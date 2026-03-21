#!/bin/bash

# Configuration
CONFIG_DIR="$HOME/.config/ai-employee"
CONFIG_FILE="$CONFIG_DIR/model.conf"
SERVICE_NAME="ai-employee.service"
HOOK_SERVICE_FILE="$HOME/myAgent/hooks/ai-employee.service"
SYSTEMD_SERVICE_FILE="$HOME/.config/systemd/user/$SERVICE_NAME"

mkdir -p "$CONFIG_DIR"

echo "🔍 Fetching available Gemini models..."

# For Google AI Pro users, the API key might not be needed if authenticated via other means (like gcloud or environment)
if [ -z "$GEMINI_API_KEY" ]; then
    echo "💡 Note: You have a Google AI Pro subscription."
    echo "If you want to fetch the absolute latest models via API, enter your key below."
    echo "Otherwise, just press [ENTER] to use the built-in Gemini 3.x list."
    read -r -s input_key
    echo "" 
    if [ -n "$input_key" ]; then
        export GEMINI_API_KEY="$input_key"
    fi
fi

# Try to fetch models if a key is available
if [ -n "$GEMINI_API_KEY" ]; then
    MODELS=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models?key=$GEMINI_API_KEY" | jq -r '.models[] | select(.name | contains("gemini")) | .name' | sed 's/models\///' 2>/dev/null)
fi

# Fallback if API call fails or key is missing
if [ -z "$MODELS" ]; then
    echo "⚠️  Could not fetch models from API. Using fallback list of latest Gemini 3.1/3 models (March 2026)."
    MODELS="gemini-3.1-pro-preview gemini-3-flash-preview gemini-3.1-flash-lite-preview"
fi

echo "Please select a model for the AI Employee:"
select MODEL in $MODELS; do
    if [ -n "$MODEL" ]; then
        echo "✅ Selected model: $MODEL"
        echo "AI_MODEL=$MODEL" > "$CONFIG_FILE"
        break
    else
        echo "Invalid selection. Please try again."
    fi
done

echo "⚙️  Updating service configuration..."

# Update the hook service file - use a safer sed pattern
sed -i "s/-m [^ ]*/-m $MODEL/" "$HOOK_SERVICE_FILE"

# Copy to systemd location and reload
cp "$HOOK_SERVICE_FILE" "$SYSTEMD_SERVICE_FILE"
systemctl --user daemon-reload
systemctl --user restart "$SERVICE_NAME"

echo "🚀 Service $SERVICE_NAME restarted with model $MODEL."
sleep 2
systemctl --user status "$SERVICE_NAME" --no-pager
