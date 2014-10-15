Live site available at http://cybersees.github.io/gi-studio


Notes:

True camera lat long
GSVPanoDepth

Panorama geometry is created inside Editor.js. The panorama sphere uses default texture mapping defined by Three.SphereGeometry.

Panorama geometry is added to "scene background" which is rendered first, then depth buffer cleared to keep objects from rendering behind the sphere

(0, 0, 0) is identified with camera and observer position

Cartoonify:

Possible strategies:

- Full-scene post-processing shader
- Process raw texture with photoshop-like filter

Relevant places in code:

- Editor.js line 119


