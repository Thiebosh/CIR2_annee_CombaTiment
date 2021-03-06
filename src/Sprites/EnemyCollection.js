import { isOver } from '../Engine/Hitbox';
import { enemiesObjects } from '../utils';

export default class EnemyCollection extends Array
{
    constructor (limit = 10, ...items)
    {
        super(...items);

        // TODO: Make this useful if we get the time
        this.limit = limit;
        this.spawnFinish = null;
    }

    getProjectiles ()
    {
        let res = [];

        this.forEach(enemy =>
        {
            if (enemy.projectiles)
            {
                enemy.projectiles.forEach(projectile =>
                {
                    res.push(projectile);
                });
            }
        });
        return res;
    }

    spawn (Enemy, scene, x, y, ground)
    {
        this.push(new Enemy(scene, x, y, ground));
    }

    spawnAll (enemies = [], delay = 100)
    {
        this.spawnFinish = false;

        let t = 0;

        enemies.forEach(enemy =>
        {
            let { type, scene, x, y } = enemy;

            setTimeout(() =>
            {
                this.spawn(type, scene, x, y, scene.ground);
            }, t);

            t += delay;
        });

        setTimeout(() =>
        {
            this.spawnFinish = true;
        }, t);
    }

    spawnWave (scene, wave, x, y)
    {
        let { enemies, timeout } = wave;
        let enemiesList = [];

        enemies.forEach(enemy =>
        {
            let offset = Math.random() * 1600;

            x -= offset;

            enemiesList.push({ type: enemiesObjects[enemy], scene, x, y });
        });

        this.spawnAll(enemiesList, timeout);
    }

    getOver (hitbox)
    {
        let enemies = new EnemyCollection(Infinity);

        this.forEach(enemy =>
        {
            if (enemy.alive && isOver(hitbox, enemy.hitboxes[enemy.hitboxes.active][0])) enemies.push(enemy);
        });

        return enemies;
    }

    looseHp (damage, all = false, kvx = null, kvy = null)
    {
        let done = 0;

        this.forEach(enemy =>
        {
            if (all || done < 2)
            {
                enemy.looseHp(damage, kvx, kvy);
                enemy.update();

                done++;
            }
        });
    }

    idle ()
    {
        this.forEach(enemy =>
        {
            if (!enemy.isDying() && !enemy.dying) enemy.idle();
        });
    }

    update (time, player)
    {
        this.forEach((enemy, index) =>
        {
            if (enemy.alive)
            {
                enemy.update(time, player, this);
            }
            else
            {
                this.splice(index, 1);
            }
        });
    }

    get export ()
    {
        let enemies = [];

        this.forEach(enemy =>
        {
            enemies.push(enemy);
        });

        return enemies;
    }
};
