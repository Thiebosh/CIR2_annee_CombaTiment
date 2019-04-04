import config from '../config/game';
import Character from './Character';

export default class Player extends Character
{
    constructor (scene, x, y, ground)
    {
        super(scene, x, y,
            'feilong/idle',
            ground,
            'feilong/hitbox',
            'feilong',
            { baseVelocity: 500, hpmax: 200 });

        this.energymax = 100;
        this.energy = this.energymax;
    }

    createAnims ()
    {
        this.createAnim('idle', this.scene.anims.generateFrameNumbers('feilong/idle', { start: 0, end: 10 }), 10);
        this.createAnim('walk', this.scene.anims.generateFrameNumbers('feilong/walking', { start: 0, end: 5 }), 10);
        this.createAnim('punch', this.scene.anims.generateFrameNumbers('feilong/punch', { start: 0, end: 3 }), 10);
        this.createAnim('jump', this.scene.anims.generateFrameNumbers('feilong/jump', { start: 0, end: 6 }), 6);
        this.createAnim('forwardjump', this.scene.anims.generateFrameNumbers('feilong/forwardjump', { start: 0, end: 8 }), 8);
    }

    setEnergy (energy)
    {
        let percent = energy / this.energymax;

        if (energy > this.energymax) energy = this.energymax;
        if (energy < 0) energy = 0;

        if (energy > this.energy) this.emit('energygain', energy - this.energy, percent, this.energymax);
        if (energy < this.energy) this.emit('energyloose', this.energy - energy, percent, this.energymax);

        this.energy = energy;
    }

    useEnergy (amount)
    {
        if (this.energy < amount) return false;

        this.setEnergy(this.energy - amount);

        return true;
    }

    gainEnergy (amount)
    {
        return this.setEnergy(this.energy + amount);
    }

    idle ()
    {
        this.hitboxes.active = 'still';
        this.anims.play('idle', true);
        this.body.setVelocityX(0);
    }

    walk (velocity = 500, right = true)
    {
        this.hitboxes.active = 'walking';
        this.setFlipX(!right);
        this.anims.play('walk', true);
        this.body.setVelocityX(right ? Math.abs(velocity) : -Math.abs(velocity));
    }

    punch ()
    {
        if (this.useEnergy(5))
        {
            this.body.setVelocityX(0);
            this.anims.play('punch', true);

            if (this.scene.sounds)
            {
                if (this.scene.sounds.punch) this.scene.sounds.punch.play();
            }
        }
    }

    jump (input)
    {
        if (input.direction.right)
        {
            this.body.setVelocityX(input.getVelocity(this.baseVelocity));
            this.setFlipX(false);
        }
        else if (input.direction.left)
        {
            this.body.setVelocityX(-input.getVelocity(this.baseVelocity));
            this.setFlipX(true);
        }
        else
        {
            this.body.setVelocityX(0);
        }

        this.body.setVelocityY(-600);
    }

    animJump ()
    {
        this.body.setVelocityX(0);
        this.anims.play('jump', true);
    }

    animForwardJump ()
    {
        this.anims.play('forwardjump', true);
    }

    animPunch ()
    {
        // if the punch animation has been triggered
        this.anims.play('punch', true);
        this.hitboxes.active = 'punch';

        if (this.anims.currentAnim.frames.length === this.anims.currentFrame.index)
        {
            // finish the punch animation
            this.anims.play('idle', true);
            this.hitboxes.active = 'still';
        }

        this.body.setVelocityX(0);
    }

    update (time, input)
    {
        if (this.anims.currentAnim !== null && this.anims.currentAnim.key === 'punch') this.animPunch();
        else if (input.attack1 && this.body.touching.down) this.punch();
        else if (input.jump && this.body.touching.down) this.jump(input);
        else if (input.direction.left && this.body.touching.down) this.walk(input.getVelocity(this.baseVelocity), false);
        else if (input.direction.right && this.body.touching.down) this.walk(input.getVelocity(this.baseVelocity), true);
        else if (!this.body.touching.down && this.body.velocity.x === 0) this.animJump();
        else if (!this.body.touching.down && this.body.velocity.x !== 0) this.animForwardJump();
        else this.idle();

        if (config.debug.character)
        {
            if (!this.hpText) this.hpText = this.scene.add.text(1500, 825, `HP: ${this.hp}/${this.hpmax}`).setOrigin(1).setFontSize(20);
            if (!this.energyText) this.energyText = this.scene.add.text(1500, 850, `Energy: ${this.energy}/${this.energymax}`).setOrigin(1).setFontSize(20);

            this.hpText.x = this.scene.cameras.main.scrollX + 1500;
            this.energyText.x = this.scene.cameras.main.scrollX + 1500;
            this.hpText.setText(`HP: ${this.hp}/${this.hpmax}`);
            this.energyText.setText(`Energy: ${this.energy}/${this.energymax}`);
        }
    }
}