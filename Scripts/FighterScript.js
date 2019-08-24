// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


cc.Class({
    extends: cc.Component,
    properties: {
            displayName:"Default Fighter",
            fightIndex : {
                default : null,
                type : cc.Integer
            },
            characteristics:{
                default : new Object(),
            },
            isPlayer:false,
            currentPage:'none',
            UIDisplay : cc.Node,
            target:null,
            team : 2,
            _Fight_Master : cc.Component ,
            _UI_Master : {
                default : null,
                type : cc.Component
            },
            possiblesActions : {
                default : [],
            },
            jsonActions : cc.JsonAsset ,
            StartingActions :{
                default : [],
                type : [cc.Prefab],
            },
    },

    onLoad () 
    {
        //this.onDestroy.on('EndTurn',function(event){this.EndTurn()});
    },

    start () {
        this._UI_Master = cc.find("Canvas").getComponent("UI_Master") ;
        this._CombatScript = cc.find("Canvas").getComponent("Fight_Master") ;
    },

    update (dt) {
        //this.Health ++ ;
    },

    
});

