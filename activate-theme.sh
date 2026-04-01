#!/bin/bash

# Modern Theme 2026 - Theme Activation Script
# Use this script to activate/reactivate the Modern Theme 2026

set -e

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                  MODERN THEME 2026 - ACTIVATION SCRIPT                       ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Change to HumHub protected directory
cd /var/www/humhub/protected

echo "🔍 Checking current theme..."
CURRENT_THEME=$(sudo -u www-data php yii theme/info | grep "Active theme:" | awk '{print $3}')
echo "   Current theme: $CURRENT_THEME"
echo ""

if [ "$CURRENT_THEME" = "ModernTheme2026" ]; then
    echo "✅ Modern Theme 2026 is already active!"
    echo ""
    read -p "Do you want to rebuild CSS and flush cache? (y/N) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🔄 Flushing cache..."
        sudo -u www-data php yii cache/flush-all
        echo "✅ Cache flushed!"
    fi
else
    echo "🔄 Switching to Modern Theme 2026..."
    sudo -u www-data php yii theme/switch ModernTheme2026
    
    echo "🔄 Flushing cache..."
    sudo -u www-data php yii cache/flush-all
    
    echo ""
    echo "✅ Theme activated successfully!"
fi

echo ""
echo "📊 Theme Information:"
sudo -u www-data php yii theme/info
echo ""
echo "✅ Done!"
