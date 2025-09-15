# WordPress Plugin Directory Assets

This directory contains all the assets required for the WordPress Plugin Directory submission.

## Required Files for WordPress.org

### Banner Images

- `banner-1544x500.jpg` or `banner-1544x500.png` - High resolution banner (required)
- `banner-772x250.jpg` or `banner-772x250.png` - Standard resolution banner (optional but recommended)

### Plugin Icons

- `icon-256x256.jpg` or `icon-256x256.png` - High resolution icon (required)
- `icon-128x128.jpg` or `icon-128x128.png` - Standard resolution icon (optional but recommended)
- `icon.svg` - Vector icon (optional, highest quality)

### Screenshots

- **Not applicable for this plugin** - Store SDK is a headless authentication plugin with no admin UI

## Current Assets

### Design Files (SVG)

- `banner-1544x500.svg` - Banner design template with modern blue gradient and security-themed elements
- `icon-256x256.svg` - Icon design template featuring shield with key symbol for authentication

**Design Inspiration:** Modern WordPress plugin aesthetic with rich blue gradients, clean typography, and security/authentication visual themes. The banner includes JWT auth badges and subtle geometric patterns, while the icon features a shield-and-key symbol representing secure authentication.

## Converting to Required Formats

### Method 1: Using Online Tools

1. **SVG to PNG/JPG**: Use tools like:

   - https://svgtopng.com/
   - https://cloudconvert.com/svg-to-png
   - https://convertio.co/svg-png/
   - Browser developer tools (take screenshot)
   - https://websitetoimage.com/

### Method 2: Using Command Line Tools

#### ImageMagick (for SVG conversion)

```bash
# Convert banner
magick banner-1544x500.svg banner-1544x500.png
magick banner-1544x500.svg -resize 772x250 banner-772x250.png

# Convert icons
magick icon-256x256.svg icon-256x256.png
magick icon-256x256.svg -resize 128x128 icon-128x128.png
```

## WordPress Directory Requirements

### Image Specifications

- **Banner**: 1544×500 pixels (high-res), 772×250 pixels (standard)
- **Icon**: 256×256 pixels (high-res), 128×128 pixels (standard)
- **Format**: PNG or JPG (PNG preferred for better quality)
- **File Size**: Keep under 1MB per image

### Naming Convention

Files must be named exactly as shown above. WordPress.org will automatically pick them up when you upload to your plugin's assets folder in SVN.

## SVN Upload Structure

Your WordPress.org SVN repository should have this structure:

```
/your-plugin-slug/
  /assets/
    banner-1544x500.png
    banner-772x250.png
    icon-256x256.png
    icon-128x128.png
  /trunk/
    store-sdk.php
    readme.txt
    /includes/
    etc...
  /tags/
    /1.0.0/
      (copy of trunk for version 1.0.0)
```

## Next Steps

1. Convert the SVG files to PNG format using your preferred method
2. Upload the banner and icon assets to your WordPress.org SVN repository's `/assets/` directory
3. The assets will automatically appear in the WordPress Plugin Directory
