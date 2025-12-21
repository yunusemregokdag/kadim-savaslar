import * as THREE from 'three';

interface MinecraftElement {
    from: [number, number, number];
    to: [number, number, number];
    rotation?: {
        angle: number;
        axis: 'x' | 'y' | 'z';
        origin: [number, number, number];
    };
    faces: Record<string, any>;
    color?: string; // Custom extension for debug
}

interface MinecraftModel {
    elements: MinecraftElement[];
    display?: Record<string, any>;
    textures?: Record<string, string>;
}

export const MinecraftModelLoader = {
    async load(url: string, color: string = '#ffffff'): Promise<THREE.Group> {
        const group = new THREE.Group();
        const textureLoader = new THREE.TextureLoader();

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to load model: ${url}`);

            const data: any = await response.json();

            // BBMODEL Support (Detect via specific keys or extension)
            const isBBModel = url.endsWith('.bbmodel') || (data.meta && data.meta.model_format === 'free');
            const elements = isBBModel ? data.elements : data.elements;

            if (!elements) return group;

            // --- TEXTURE RESOLUTION LOGIC ---
            // Attempt to derive properties from URL to find texture path
            // Expected format: .../assets/<namespace>/models/<path>
            // Texture path: .../assets/<namespace>/textures/<texture_key_without_namespace>.png
            let textureMap: Record<string, THREE.Texture> = {};

            if (data.textures) {
                let basePath = '';
                let defaultNamespace = 'minecraft';

                if (url.includes('/assets/')) {
                    const parts = url.split('/assets/');
                    basePath = parts[0] + '/assets/';
                    const afterAssets = parts[1];
                    defaultNamespace = afterAssets.split('/')[0];
                } else {
                    // Fallback for new /models/skills structure
                    // URL: /models/skills/warrior/foo.json
                    const match = url.match(/\/models\/skills\/([^\/]+)\//);
                    if (match) {
                        const className = match[1];
                        // Hardcoded assumption based on user's folder structure
                        basePath = `/models/Character/${className}/resourcepack (for players)/assets/`;
                        defaultNamespace = 'minecraft';
                    }
                }

                if (basePath) {
                    const loadTexturePromises = Object.keys(data.textures).map(async (key) => {
                        let texVal = data.textures[key];
                        // If variable reference "#foo", resolve it (simple resolve)
                        while (texVal.startsWith('#')) {
                            texVal = data.textures[texVal.substring(1)];
                        }

                        // Parse "namespace:path/to/texture"
                        let texNamespace = defaultNamespace;
                        let texPath = texVal;

                        if (texVal.includes(':')) {
                            const texParts = texVal.split(':');
                            texNamespace = texParts[0];
                            texPath = texParts[1];
                        }

                        const finalTextureUrl = `${basePath}${texNamespace}/textures/${texPath}.png`;

                        try {
                            const texture = await new Promise<THREE.Texture>((resolve, reject) => {
                                textureLoader.load(finalTextureUrl,
                                    (t) => {
                                        t.magFilter = THREE.NearestFilter; // Minecraft style pixelated
                                        t.minFilter = THREE.NearestFilter;
                                        t.colorSpace = THREE.SRGBColorSpace;
                                        resolve(t);
                                    },
                                    undefined,
                                    (err) => {
                                        // FALLBACK: If namespace was not minecraft, try minecraft
                                        if (texNamespace !== 'minecraft') {
                                            const fallbackUrl = `${basePath}minecraft/textures/${texPath}.png`;
                                            // console.log("Retrying texture with minecraft namespace:", fallbackUrl);
                                            textureLoader.load(fallbackUrl,
                                                (t2) => {
                                                    t2.magFilter = THREE.NearestFilter;
                                                    t2.minFilter = THREE.NearestFilter;
                                                    t2.colorSpace = THREE.SRGBColorSpace;
                                                    resolve(t2);
                                                },
                                                undefined,
                                                () => {
                                                    console.warn("Texture load failed (final):", finalTextureUrl);
                                                    resolve(new THREE.Texture());
                                                }
                                            );
                                        } else {
                                            console.warn("Texture load failed (soft):", finalTextureUrl);
                                            resolve(new THREE.Texture());
                                        }
                                    }
                                );
                            });
                            textureMap[key] = texture;
                            textureMap['#' + key] = texture; // Handle ref syntax just in case
                        } catch (e) {
                            console.warn("Texture resolution error:", e);
                        }
                    });

                    await Promise.all(loadTexturePromises);
                }
            }

            // EMISSIVE & MATERIAL SETUP
            const isEmissive = url.includes('slash') || url.includes('meteor') || url.includes('beam') || url.includes('magic');

            // Create a general material as fallback, but we will try to make unique materials per face if needed
            // For simplicity in this v1 loader, we use one material per element if possible, or mapping

            elements.forEach((el: any) => {
                // Calculate Size with Epsilon to prevent NaN normals on 0-thickness planes
                const minX = el.from[0];
                const minY = el.from[1];
                const minZ = el.from[2];
                const maxX = Math.max(el.to[0], minX + 1e-4);
                const maxY = Math.max(el.to[1], minY + 1e-4);
                const maxZ = Math.max(el.to[2], minZ + 1e-4);

                // Manually build BufferGeometry to support custom UVs per face
                const geometry = new THREE.BufferGeometry();

                // 6 Faces, 4 Verts per face, 3 coords per vert
                const vertices: number[] = [];
                const uvs: number[] = [];
                const indices: number[] = [];
                const normals: number[] = []; // Explicit normals

                // Material groups
                const materials: THREE.Material[] = [];
                let vertOffset = 0;

                const faces = ['east', 'west', 'up', 'down', 'south', 'north'];

                faces.forEach((faceName, materialIndex) => {
                    const faceDef = el.faces[faceName];
                    if (!faceDef) return; // Skip missing faces

                    // --- 1. VERTICES ---
                    // Validate coordinates to prevent NaN/Infinity
                    const validate = (n: number) => Number.isFinite(n) ? n : 0;

                    let v1, v2, v3, v4; // [x,y,z]

                    if (faceName === 'north') { // -Z
                        v1 = [maxX, minY, minZ]; v2 = [minX, minY, minZ]; v3 = [minX, maxY, minZ]; v4 = [maxX, maxY, minZ];
                    } else if (faceName === 'south') { // +Z
                        v1 = [minX, minY, maxZ]; v2 = [maxX, minY, maxZ]; v3 = [maxX, maxY, maxZ]; v4 = [minX, maxY, maxZ];
                    } else if (faceName === 'east') { // +X
                        v1 = [maxX, minY, maxZ]; v2 = [maxX, minY, minZ]; v3 = [maxX, maxY, minZ]; v4 = [maxX, maxY, maxZ];
                    } else if (faceName === 'west') { // -X
                        v1 = [minX, minY, minZ]; v2 = [minX, minY, maxZ]; v3 = [minX, maxY, maxZ]; v4 = [minX, maxY, minZ];
                    } else if (faceName === 'up') { // +Y
                        v1 = [minX, maxY, maxZ]; v2 = [maxX, maxY, maxZ]; v3 = [maxX, maxY, minZ]; v4 = [minX, maxY, minZ];
                    } else if (faceName === 'down') { // -Y
                        v1 = [minX, minY, minZ]; v2 = [maxX, minY, minZ]; v3 = [maxX, minY, maxZ]; v4 = [minX, minY, maxZ];
                    }

                    // Sanitize vertices
                    if (v1) v1 = v1.map(validate);
                    if (v2) v2 = v2.map(validate);
                    if (v3) v3 = v3.map(validate);
                    if (v4) v4 = v4.map(validate);

                    if (v1 && v2 && v3 && v4) {
                        vertices.push(...v1, ...v2, ...v3, ...v4);

                        // --- 2. INDICES ---
                        indices.push(vertOffset, vertOffset + 1, vertOffset + 2);
                        indices.push(vertOffset + 2, vertOffset + 3, vertOffset);

                        // --- 3. UVS ---
                        let uv = faceDef.uv || [0, 0, 16, 16];
                        if (!Array.isArray(uv) || uv.length < 4 || uv.some(n => !Number.isFinite(n))) {
                            uv = [0, 0, 16, 16];
                        }

                        let x1 = uv[0] / 16;
                        let y1 = uv[1] / 16;
                        let x2 = uv[2] / 16;
                        let y2 = uv[3] / 16;
                        y1 = 1 - y1;
                        y2 = 1 - y2;

                        uvs.push(x2, y2); // v1
                        uvs.push(x1, y2); // v2
                        uvs.push(x1, y1); // v3
                        uvs.push(x2, y1); // v4

                        // --- 4. NORMALS (Explicitly defined) ---
                        let nx = 0, ny = 0, nz = 0;
                        if (faceName === 'north') nz = -1;
                        else if (faceName === 'south') nz = 1;
                        else if (faceName === 'east') nx = 1;
                        else if (faceName === 'west') nx = -1;
                        else if (faceName === 'up') ny = 1;
                        else if (faceName === 'down') ny = -1;

                        normals.push(nx, ny, nz);
                        normals.push(nx, ny, nz);
                        normals.push(nx, ny, nz);
                        normals.push(nx, ny, nz);

                        vertOffset += 4;

                        // --- MATERIAL ---
                        let map = null;
                        if (faceDef.texture) {
                            let texRef = faceDef.texture;
                            if (texRef.startsWith('#')) texRef = texRef.substring(1);
                            map = textureMap[texRef] || textureMap[faceDef.texture] || null;
                        }

                        geometry.addGroup(vertOffset - 4, 6, materialIndex);

                        materials[materialIndex] = new THREE.MeshStandardMaterial({
                            color: map ? '#ffffff' : color,
                            map: map,
                            transparent: true,
                            opacity: 1,
                            alphaTest: 0.1,
                            roughness: 0.4,
                            metalness: 0.5,
                            emissive: isEmissive ? (map ? '#ffffff' : color) : '#000000',
                            emissiveIntensity: isEmissive ? 1.0 : 0,
                            emissiveMap: isEmissive ? map : null,
                            side: THREE.DoubleSide
                        });
                    }
                });

                // Assign attributes
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
                geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
                geometry.setIndex(indices);
                // geometry.computeVertexNormals(); // DISABLED: Causes NaN on degenerate geometry

                // Create Mesh
                // Filter empty materials (holes in array)
                // Use a proxy material array or just fill holes with invisible mat
                const safeMaterials = faces.map((key, i) => materials[i] || new THREE.MeshBasicMaterial({ visible: false }));

                const mesh = new THREE.Mesh(geometry, safeMaterials);

                // Position relative to center
                // With BufferGeometry using raw coords, we just need to shift by -8, -8, -8 globally (or pivot)
                // BUT wait, my coordinates used minX, maxX etc. which are absolute in MC space.
                // So the mesh is already "sized". We just need to position the WHOLE mesh relative to origin.
                // MC Origin is at 0,0,0 of its space? No, 8,8,8 is center.
                // My pivot math below expects mesh at 0 relative to pivot?
                // Actually my previous logic:
                // cx = from + w/2.
                // mesh.pos = cx - 8.
                // This means mesh origin is at center of block.
                // BufferGeometry vertices are relative to mesh position (0,0,0).
                // So I should subtract the center from vertices? Or just construct geometry around 0?
                // Easier: Construct geometry in place (absolute MC coords).
                // Then set mesh.position to (-8, -8, -8).

                mesh.position.set(-8, -8, -8);

                // Rotation
                if (el.rotation) {
                    const origin = el.rotation.origin;
                    const pivot = new THREE.Group();
                    pivot.position.set(origin[0] - 8, origin[1] - 8, origin[2] - 8);

                    // We need to move the mesh so that the "origin" point matches the pivot (0,0,0)
                    // Mesh is at (-8,-8,-8) relative to world.
                    // Pivot is at (ox-8, oy-8, oz-8).
                    // If we put mesh inside pivot, mesh pos should be:
                    // WorldPos - PivotPos
                    // (-8, -8, -8) - (ox-8, oy-8, oz-8) = (-ox, -oy, -oz)

                    mesh.position.set(-origin[0], -origin[1], -origin[2]);

                    pivot.add(mesh);

                    if (el.rotation.axis === 'x') pivot.rotation.x = el.rotation.angle * (Math.PI / 180);
                    if (el.rotation.axis === 'y') pivot.rotation.y = el.rotation.angle * (Math.PI / 180);
                    if (el.rotation.axis === 'z') pivot.rotation.z = el.rotation.angle * (Math.PI / 180);

                    group.add(pivot);
                } else {
                    group.add(mesh);
                }
            });

            // Global Scale
            group.scale.set(0.0625, 0.0625, 0.0625);

            // Apply Display Transforms
            if (url.includes('slash') || url.includes('strike')) {
                group.scale.multiplyScalar(3);
            }

        } catch (e) {
            console.error('Error parsing Minecraft Model:', e);
        }

        return group;
    }
};
