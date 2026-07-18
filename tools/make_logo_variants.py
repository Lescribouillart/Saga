from PIL import Image, ImageFilter
import os
src = os.path.join('images','logo','logoldeux.png')
outdir = os.path.join('images','logo')
for size in (72, 144):
    img = Image.open(src).convert('RGBA')
    resized = img.resize((size,size), Image.Resampling.LANCZOS)
    # Apply slight unsharp mask to increase perceived sharpness
    sharpened = resized.filter(ImageFilter.UnsharpMask(radius=1, percent=150, threshold=3))
    out = os.path.join(outdir, f'logoldeux-{size}w.png')
    sharpened.save(out, optimize=True)
    print('Saved', out)
print('Done')
