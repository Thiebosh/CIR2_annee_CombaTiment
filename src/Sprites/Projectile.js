import Phaser from 'phaser';
import { Hitbox } from '../Engine/Hitbox';

export default class Projectile extends Phaser.GameObjects.Sprite
{
    constructor (scene, x, y, spritesheet, settings = {})
    {
        super(scene, x, y, spritesheet);

        let flipped = settings.flipped || false;

        this.baseVelocityX = settings.baseVelocityX || 100;
        this.baseVelocityY = settings.baseVelocityY || 0;
        this.gravity = !(!settings.gravity || false);

        if (flipped) this.baseVelocityX *= -1;

        scene.physics.world.enable(this);
        scene.add.existing(this);

        this.body.allowGravity = this.gravity;
        this.body.setVelocityX(this.baseVelocityX);
        this.body.setVelocityY(this.baseVelocityY);
        this.setFlipX(flipped);
        this.hitbox = new Hitbox({
            type: 'hurtbox',
            anchor: { x, y },
            width: this.displayWidth,
            height: this.displayHeight,
            end: 1
        });

        this.timer = setInterval(() =>
        {
            this.update(this.scene.player, this.scene.enemies);
        }, 10);
    }

    update (player, enemies = [])
    {
        this.hitbox.setXY(this.x - this.displayWidth / 2, this.y - this.displayHeight / 2);

        let x = this.x;
        let camera = this.scene.cameras.main;

        if (x < camera.scrollX || x > camera.scrollX + camera.width)
        {
            clearInterval(this.timer);
            this.destroy();
        }
    }
}
