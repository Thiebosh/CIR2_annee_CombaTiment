import Projectile from '../Projectile';
import { isOver } from '../../Engine/Hitbox';

export default class IceCube extends Projectile
{
    constructor (scene, x, y, vx, vy, bounce = 0)
    {
        super(scene, x, y, 'projectiles/icecube', {
            baseVelocityX: (vx !== undefined) ? vx : -300,
            baseVelocityY: (vy !== undefined) ? vy : 0,
            gravity: true
        });

        this.setScale(4);
        this.lastHit = -1;
        this.body.setBounce(bounce, bounce);
        this.createAnim('iceCube', scene.anims.generateFrameNumbers('projectiles/icecube', { start: 0, end: 11 }), 10);
        this.anims.play('iceCube');
    }

    update (player, enemies = [])
    {
        super.update();

        if (isOver(this.hitbox, player.hitboxes[player.hitboxes.active][0]))
        {
            if (this.time - this.lastHit > 500 || this.lastHit === -1)
            {
                player.looseHp(30);
                this.lastHit = this.time;
            }

            if (player.dashing) this.destroy();
        }
    }
}
