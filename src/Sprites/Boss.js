
import Character from './Character';
import IceCube from './Projectiles/IceCube';
import { isOver } from '../Engine/Hitbox';

export default class Boss extends Character
{
    constructor (scene, name, x, y, spritesheet, ground, hitboxes, hitboxName, anims = {}, settings = {})
    {
        let hpmax = settings.hpmax || 40;
        let scale = settings.scale || 1;

        super(scene, x, y,
            spritesheet,
            ground,
            hitboxes,
            hitboxName,
            { hpmax });

        this.name = name;
        this.setScale(scale);

        this.spawnX = settings['spawnX'];
        this.spawnY = settings['spawnY'];

        this.pattern = settings['pattern'];
        this.patternDone = true;
        this.patternId = 0;
        this.attackId = 0;
        this.continueAttack = true;

        this.attackDamage = settings.attackDamage || 10;
        this.attackDone = false;
        this.projectiles = [];

        if (anims) this.createAnims(anims);
    }

    createAnims (anims)
    {
        if (anims)
        {
            if (anims['idle']) this.createAnim(this.name + 'Idle', anims['idle']['anim'], anims['idle']['framerate']);
            if (anims['attack']) this.createAnim(this.name + 'Attack', anims['attack']['anim'], anims['attack']['framerate']);
            if (anims['spawn']) this.createAnim(this.name + 'Spawn', anims['spawn']['anim'], anims['spawn']['framerate']);
            if (anims['throw']) this.createAnim(this.name + 'Throw', anims['throw']['anim'], anims['throw']['framerate']);
        }
    }

    idle ()
    {
        this.hitboxes.active = 'still';
        this.anims.play(this.name + 'Idle', true);
        this.body.setVelocityX(0);
    }

    looseHp (amount, kvx, kvy)
    {
        super.looseHp(amount);

        if (this.hp > 0)
        {
            let vx = kvx || amount * 15;
            let vy = -(kvy || amount * 5);

            if (!kvx) if (this.scene.player.flipX) vx *= -1;

            this.anims.play(this.name + 'Idle', true);
            this.body.setVelocity(vx, vy);
        }
    }

    attack (target)
    {
        this.anims.play(this.name + 'Attack', true);
        this.body.setVelocityX(0);
    }

    damage (target, damage)
    {
        if (damage >= target.hp)
        {
            this.scene.cameras.main.flash(2000);
            this.scene.cameras.main.shake(200, 0.1);
        }
        else
        {
            this.scene.cameras.main.shake(damage * 5, damage * 20e-5);
        }

        target.looseHp(damage);
    }

    animAttack (target)
    {
        this.anims.play(this.name + 'Attack', true);
        this.hitboxes.active = 'attack';

        let frame = this.anims.currentFrame.index;

        if (frame >= this.hitboxes.attack[1].start && frame <= this.hitboxes.attack[1].end && !this.attackDone)
        {
            this.attackDone = true;

            if (this.canAttack(target) && target.alive) this.damage(target, this.attackDamage);
        }

        if (frame === this.anims.currentAnim.frames.length)
        {
            this.anims.play(this.name + 'Idle', true);
            this.hitboxes.active = 'still';
            this.attackDone = false;
        }

        this.body.setVelocityX(0);
    }

    spawn (enemies, wave, x, y)
    {
        this.anims.play(this.name + 'Spawn', true);
        enemies.spawnWave(this.scene, wave, x, y);
    }

    animSpawn (target)
    {
        this.anims.play(this.name + 'Spawn', true);
        this.hitboxes.active = 'attack';

        let frame = this.anims.currentFrame.index;

        if (frame >= this.hitboxes.attack[1].start && frame <= this.hitboxes.attack[1].end && !this.attackDone)
        {
            this.attackDone = true;

            if (this.canAttack(target) && target.alive) this.damage(target, this.attackDamage);
        }

        if (frame === this.anims.currentAnim.frames.length)
        {
            this.anims.play(this.name + 'Idle', true);
            this.hitboxes.active = 'still';
            this.attackDone = false;
        }

        this.body.setVelocityX(0);
    }

    throw ()
    {
        this.anims.play(this.name + 'Throw', true);
    }

    animThrow ()
    {
        this.anims.play(this.name + 'Throw', true);
        this.hitboxes.active = 'still';

        if (Math.floor(this.anims.currentAnim.frames.length / 2) + 1 === this.anims.currentFrame.index && !this.projectileCreated)
        {
            if (this.projectileName === 'IceCube') this.projectiles.push(new IceCube(this.scene, this.x + 180, this.y + 200, -300, -500));
            this.projectileCreated = true;
            if (this.scene.sounds)
            {
                if (this.projectileName === 'IceCube' && this.scene.sounds.iceCube) this.scene.sounds.iceCube.play();
            }
        }

        if (this.anims.currentAnim.frames.length === this.anims.currentFrame.index)
        {
            this.anims.play(this.name + 'Idle', true);
            this.hitboxes.active = 'still';
            this.projectileCreated = false;
        }

        this.body.setVelocityX(0);
    }

    isThrowing ()
    {
        return this.anims.currentAnim !== null && this.anims.currentAnim.key === this.name + 'Throw';
    }

    isSpawning ()
    {
        return this.anims.currentAnim !== null && this.anims.currentAnim.key === this.name + 'Spawn';
    }

    isAttacking ()
    {
        return this.anims.currentAnim !== null && this.anims.currentAnim.key === this.name + 'Attack';
    }

    canAttack (character)
    {
        return isOver(this.hitboxes.attack[1], character.hitboxes[character.hitboxes.active][0]);
    }

    die ()
    {
        let tick = 0;
        let timer = setInterval(() =>
        {
            tick++;

            if (!this.alive) clearInterval(timer);
            else
            {
                this.setAlpha(1 - 0.01 * tick);
            }
        }, 10);

        setTimeout(() => super.die(), 100);
    }

    followPattern (player)
    {
        if (this.patternDone)
        {
            this.patternId = Math.floor(Math.random() * this.pattern.length);
            this.attackId = 0;
            this.patternDone = false;
        }

        if (this.continueAttack)
        {
            let attack = this.pattern[this.patternId][this.attackId];

            if (attack === 'throw') this.throw();
            else if (attack === 'spawn') this.spawn(this.scene.enemies, this.scene.data.waves[this.scene.data.waves.length - 1], this.spawnX, this.spawnY);

            this.continueAttack = false;
            setTimeout(() =>
            {
                this.continueAttack = true;
            }, 3000);

            this.attackId++;
            if (this.attackId === this.pattern[this.patternId].length) this.patternDone = true;
        }
    }

    update (time, player)
    {
        if (this.scene && this.scene.paused) this.idle();

        if (this.isAttacking()) this.animAttack(player);
        else if (this.isSpawning()) this.animSpawn(player);
        else if (this.isThrowing()) this.animThrow();
        else if (player && player.alive && this.canAttack(player)) this.attack(player);
        else this.followPattern(player);

        super.update();
    }
}