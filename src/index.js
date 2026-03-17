import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import card from "./Card.js";

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, maxPower, image) {
        super(name, maxPower, image);
        let _currentPower = this.currentPower;
        Object.defineProperty(this, 'currentPower', {
            get: function() { return _currentPower; },
            set: function(value) {
                _currentPower = Math.min(value, this.maxPower);
            },
            configurable: true,
            enumerable: true
        });
    }

    getDescriptions() {
        return [getCreatureDescription(this), ...super.getDescriptions()];
    }
}

// Основа для утки.
// function Duck() {
//     this.quacks = function () { console.log('quack') };
//     this.swims = function () { console.log('float: both;') };
// }

class Duck extends Creature {
    constructor() {
        super('Мирная утка', 2);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }

    isDuck() {
        return true;
    }
}


// Основа для собаки.
// function Dog() {
// }
class Dog extends Creature {
    constructor() {
        super('Пес-бандит', 3);
    }

    isDog() {
        return true;
    }
}

class Gatling extends Creature {
    constructor() {
        super('Гатлинг', 6);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const { oppositePlayer } = gameContext;
        const oppoCards = oppositePlayer.table;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for (let pos = 0; pos < oppoCards.length; pos++) {
            const card = oppoCards[pos];
            if (card) {
                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, card, gameContext, onDone);
                });
            }
        }

        taskQueue.continueWith(continuation);
    }
}

class Trasher extends Dog {
    constructor() {
        super('Громила', 5);
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value - 1);
        });
    };

    getDescriptions() {
        const parentDescr = super.getDescriptions();
        parentDescr.push('Получает на 1 меньше урона');
        return parentDescr;
    }
}

class PseudoDuck extends Dog {
    constructor() {
        super('Псевдоутка', 3);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

class Brewer extends Duck {
    constructor() {
        super('Пивовар', 2);
    }

    doBeforeAttack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const allCards = [
            ...gameContext.currentPlayer.table,
            ...gameContext.oppositePlayer.table
        ];
        const ducks = allCards.filter(card => card && isDuck(card));

        for (const duck of ducks) {
            taskQueue.push(onDone => {
                duck.maxPower += 1;
                duck.currentPower += 2;
                duck.updateView();
                duck.view.signalHeal(onDone);
            });
        }

        taskQueue.continueWith(continuation);
    }
}


const seriffStartDeck = [
    new Duck(),
    new Brewer(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Dog(),
    new PseudoDuck(),
    new Dog(),
    new Trasher(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
