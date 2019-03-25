import Phaser from 'phaser';

import Character from '../Sprites/Character';
import Input from '../Input/Input';
import { updateHitboxes, renderHitboxes } from '../Engine/Hitbox';

export default class extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'Level' });
    }

    init ()
    {}

    create ()
    {
        this.sounds = {};
        this.sounds.music = this.sound.add('music/tem', { loop: true, volume: 0.3 });
        this.sounds.punch = this.sound.add('music/punch', { volume: 0.5 });
        this.sounds.music.play();

        this.data = this.cache.json.get('scenes/data');
        this.data.lastWaveScreen = 0;
        this.data.currentWave = 0;
        this.data.waveScreenFinished = true;
        this.data.waveFinished = true;
        this.data.finishingWave = false;
        this.data.ennemiesOnScreen = 0;

        this.physics.world.bounds.width = 5600;
        this.physics.world.bounds.height = 900;
        this.add.image(800, 450, 'levelselect/background');
        this.add.image(2400, 450, 'levelselect/background');
        this.add.image(4000, 450, 'levelselect/background');
        this.add.image(5600, 450, 'levelselect/background');

        this.ground = this.physics.add.staticGroup();
        this.ground.create(800, 810, 'levelselect/ground');
        this.add.image(800, 710, 'levelselect/grass');
        this.ground.create(2400, 810, 'levelselect/ground');
        this.add.image(2400, 710, 'levelselect/grass');
        this.ground.create(4000, 810, 'levelselect/ground');
        this.add.image(4000, 710, 'levelselect/grass');
        this.ground.create(5600, 810, 'levelselect/ground');
        this.add.image(5600, 710, 'levelselect/grass');

        this.player = new Character(this, 40, 500, 'feilong/idle', this.ground, 'feilong/hitbox', 'feilong');
        this.player.createAnim(this, 'idle', this.anims.generateFrameNumbers('feilong/idle', { start: 0, end: 10 }), 10, -1);
        this.player.createAnim(this, 'walk', this.anims.generateFrameNumbers('feilong/walking', { start: 0, end: 5 }), 10, -1);
        this.player.createAnim(this, 'punch', this.anims.generateFrameNumbers('feilong/punch', { start: 0, end: 3 }), 10, -1);

        this.hitboxGraphics = this.add.graphics();

        this.cameras.main.setBounds(0, 0, 5600, 900);
        this.cameras.main.startFollow(this.player.body);
        this.moveCamera = 0;
    }

    handleWave (index)
    {
        let wave = this.data.waves[this.data.screens[index].waves[this.data.currentWave]];

        if (this.data.waveFinished) // if the previous wave is finished
        {
            this.data.waveFinished = false;
            console.log(wave.ennemies.length + ' ennemies spawned !'); // spawn new ennemies
            this.data.ennemiesOnScreen += wave.ennemies.length;
            this.data.currentWave++;
            /* this.ennemySpawn = setInterval(function(){
                console.log("Ennemy " + wave.ennemies[this.data.ennemiesOnScreen] + " spawned !");
                this.data.ennemiesOnScreen++;
                console.log(wave.ennemies.length);
                if(this.data.nbEnnemies >= wave.ennemies.length)
                {
                    clearInterval(scene.ennemySpawn);
                }
            }, 100); */
        }

        if (this.data.ennemiesOnScreen <= this.data.screens[index].nextWave.ennemiesNumber)
        {
            // go to next wave if the condition is fulfilled or if there are no ennemies (for the last wave)
            if (this.data.screens[index].waves.length === this.data.currentWave)
            {
                if (!this.data.ennemiesOnScreen)
                {
                    this.data.waveFinished = true;
                }
            }
            else
            {
                this.data.waveFinished = true;
            }
        }

        if (this.data.waveFinished && this.data.screens[index].waves.length === this.data.currentWave)
        {
            // if all waves of the waveScreen are finished
            this.data.waveScreenFinished = true;
            this.data.finishingWave = true;
            this.data.currentWave = 0;
        }
    }

    finishWave ()
    {
        // fluid transition
        if (this.player.x - this.cameras.main.scrollX >= this.cameras.main.width / 2 + 21)
        {
            this.moveCamera++;
            if (this.moveCamera > 20) this.moveCamera = 20;
            this.cameras.main.setScroll(this.cameras.main.scrollX + this.moveCamera, 0);
        }
        else if (this.player.x - this.cameras.main.scrollX <= this.cameras.main.width / 2 - 21)
        {
            this.moveCamera++;
            if (this.moveCamera > 20) this.moveCamera = 20;
            this.cameras.main.setScroll(this.cameras.main.scrollX - this.moveCamera, 0);
        }
        else
        {
            this.cameras.main.startFollow(this.player);
            this.physics.world.bounds.left = 0;
            this.physics.world.bounds.right = 5600;
            this.data.finishingWave = false;
            this.moveCamera = 0;
        }
    }

    handleCamera ()
    {
        if (this.data.lastWaveScreen !== this.data.screens.length)
        {
            // if there is any waveScreen left to defeat
            if (this.player.x >= 1000 + 1600 * this.data.lastWaveScreen && this.cameras.main.scrollX < 750 + 1600 * this.data.lastWaveScreen)
            {
                // fluid transition
                this.cameras.main.stopFollow();
                this.moveCamera++;
                if (this.moveCamera > 20) this.moveCamera = 20;
                this.cameras.main.setScroll(this.cameras.main.scrollX + this.moveCamera, 0);
                if (this.cameras.main.scrollX >= 750 + 1600 * this.data.lastWaveScreen)
                {
                    this.physics.world.bounds.left = this.cameras.main.scrollX;
                    this.physics.world.bounds.right = this.cameras.main.scrollX + this.cameras.main.width;
                    this.moveCamera = 0;
                    this.data.waveScreenFinished = false;
                    this.data.lastWaveScreen++;
                }
            }
        }

        if (!this.data.waveScreenFinished)
        {
            this.handleWave(this.data.lastWaveScreen - 1); // start and handle the waveScreen
        }

        if (this.data.finishingWave)
        {
            this.finishWave(); // fluid transition
        }
    }

    update ()
    {
        let input = new Input({ keyboard: this.input.keyboard, gamepad: this.input.gamepad });

        if (input.attack1)
        {
            this.data.ennemiesOnScreen--; // kill an ennemy
            if (this.data.ennemiesOnScreen < 0)
            {
                this.data.ennemiesOnScreen = 0;
            }
            console.log(this.data.ennemiesOnScreen);
        }

        this.player.checkActions(input);

        this.handleCamera(); // handle camera and waveScreens if needed

        updateHitboxes(this.player); // update player's hitbox's position
        renderHitboxes(this.hitboxGraphics, [this.player]); // render hitboxes (debug)
    }
};