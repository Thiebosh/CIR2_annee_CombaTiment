import Boss from '../Boss';

export default class BossFridge extends Boss
{
    constructor (scene, x, y, ground)
    {
        super(
            scene, 'bossFridge', x, y,
            'enemies/bossFridge',
            ground,
            'enemies/bossFridge/hitbox', 'bossFridge',
            {
                'idle': { 'anim': scene.anims.generateFrameNumbers('enemies/bossFridge', { start: 0, end: 3 }), 'framerate': 6 },
                'attack': { 'anim': scene.anims.generateFrameNumbers('enemies/bossFridge', { start: 5, end: 10 }), 'framerate': 10 },
                'spawn': { 'anim': [
                    { key: 'enemies/bossFridge', frame: 13 },
                    { key: 'enemies/bossFridge', frame: 13 },
                    { key: 'enemies/bossFridge', frame: 13 },
                    { key: 'enemies/bossFridge', frame: 12 }
                ],
                'framerate': 2
                },
                'throw': { 'anim': scene.anims.generateFrameNumbers('enemies/bossFridge', { start: 14, end: 22 }), 'framerate': 10 },
                'airStrike': { 'anim': [
                    { key: 'enemies/bossFridge', frame: 14 },
                    { key: 'enemies/bossFridge', frame: 15 },
                    { key: 'enemies/bossFridge', frame: 16 },
                    { key: 'enemies/bossFridge', frame: 17 },
                    { key: 'enemies/bossFridge', frame: 18 },
                    { key: 'enemies/bossFridge', frame: 18 },
                    { key: 'enemies/bossFridge', frame: 18 },
                    { key: 'enemies/bossFridge', frame: 19 },
                    { key: 'enemies/bossFridge', frame: 20 },
                    { key: 'enemies/bossFridge', frame: 21 },
                    { key: 'enemies/bossFridge', frame: 22 }
                ],
                'framerate': 7
                },
                'death': { 'anim': scene.anims.generateFrameNumbers('enemies/bossFridge', { start: 23, end: 36 }), 'framerate': 3 }
            },
            {
                scale: 1.5,
                pattern: scene.cache.json.get('enemies/bossFridge/pattern'),
                spawnX: 80,
                spawnY: 235,
                hpmax: 1500,
                cooldown: 4000,
                offset: -100,
                xProjectile: 180,
                yProjectile: 200,
                vxProjectile: -300,
                vyProjectile: -500,
                xAirStrike: 180,
                yAirStrike: 200,
                vxAirStrike: -100,
                vyAirStrike: -1500
            }
        );

        this.projectileName = 'IceCube';
        this.reverseFlipX = true;
        this.setFlipX(this.reverseFlipX);
    }
}
