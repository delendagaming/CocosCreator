// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var Effect = require('GameEffect') ;

cc.Class({
    extends : cc.Component,
    name : "GameAction",
    properties: {
        Strengh : 100,
        AttributeModifier : {
            default : []
        },
        ActionName : cc.String,
        DisplayName : {default : "game action"},
        Effects : {
            default : []
            ,type : Effect
            ,serializable : false
        },
        executeInEditMode : true ,
        Goal : {
            default : []
            ,type : cc.String 
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
    },

    // LIFE-CYCLE CALLBACKS:

     onLoad () {
     },

    start () {
        cc.log('test action ');
    },

    Execute()
    {
        cc.log("execute")
    }

    ,GetAction(act)
    {
        //var act = null;
        var ef = new Effect();
        this.DisplayName = act ;
        switch(act){
            case 'Attack':
                //this.Execute = 
                break ;
            case 'Defend':
                break ;
            case 'Heal':
                    break ;
            case 'Spell':
                break ;
            case 'Object':
                    break ;
            default : 
        }
        
    }
    // update (dt) {},
});
