// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var operator = cc.Enum({
    add : 1
    ,multiply : 2
    ,Ovverride : 3
    ,Invalid :4
}) ;

cc.Class({
    properties: {
        name : "BaseEffect",
        Icon : cc.Sprite,
        Sound:{
            default: null,
            type: cc.AudioClip
        },
        duration:{
            default:0,
            type : cc.Integer
        },
        attributeTargeted:"healthPoints",
        baseAttributeCalculation:"attackPoints",
        sourceAttributeCalculation:"Self",
        coeffAttributeCalculation : 1.5,
        preCalculationAddition:0,
        postCalculationAddition:0,
        typeOfCalculation:operator.add ,
        target : "Ennemy",
        requirement:{
            default:[],
            type : cc.String,
        },
        consequence : "TargetDead",
        Tags:{
            default : [],
            type : cc.String,
        },
        sourceTags:{
            default : [],
            type : cc.String,
        },
        targetTags:{
            default : [],
            type : cc.String,
        },


    },




        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},
});
