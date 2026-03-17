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
        parentDescr.push('Громила: Получает на 1 меньше урона');
        return parentDescr;
    }
}

class Lad extends Dog {
    constructor() {
		super('Браток', 2);
    }

    static getInGameCount() { 
        return this.inGameCount || 0; 
    } 

    static setInGameCount(value) { 
        this.inGameCount = value; 
    }

    doAfterComingIntoPlay(gameContext, continuation) {
        Lad.setInGameCount(Lad.getInGameCount() + 1);
        super.doAfterComingIntoPlay(gameContext, continuation);
    }

    doBeforeRemoving(continuation) {
        Lad.setInGameCount(Lad.getInGameCount() - 1);
        super.doBeforeRemoving(continuation);
    }

    static getBonus() {
        const cnt = this.getInGameCount();
        return cnt * (cnt + 1) / 2
    }

    modifyDealedDamageToCreature(value, toCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(value + Lad.getBonus());
        });
    }

    modifyTakenDamage(value, fromCard, gameContext, continuation) {
        this.view.signalAbility(() => {
            continuation(Math.max(0, value - Lad.getBonus()));
        });
    };

    getDescriptions() {
        const parentDescr = super.getDescriptions();
        if (Lad.prototype.hasOwnProperty('modifyDealedDamageToCreature') ||
            Lad.prototype.hasOwnProperty('modifyTakenDamage')) {
            parentDescr.push('Чем их больше, тем они сильнее');
        }
        return parentDescr;
    }
}


// Колода Шерифа, нижнего игрока.
// const seriffStartDeck = [
//     new Card('Мирный житель', 2),
//     new Card('Мирный житель', 2),
//     new Card('Мирный житель', 2),
// ];

// // Колода Бандита, верхнего игрока.
// const banditStartDeck = [
//     new Card('Бандит', 3),
// ];
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
];
const banditStartDeck = [
    new Lad(),
    new Lad(),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
