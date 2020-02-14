

// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var playerClass = require('Player');

cc.Class({
    extends: cc.Component,

    properties: {

        SceneNameNode : cc.EditBox,
        loadedQuests : {
            type : cc.JsonAsset , 
            default : [],
        },
        currentQuest : null ,
        player : playerClass ,
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
        
        cc.game.addPersistRootNode(this.node) //set this node as persistent

    },

    loadFromMenu()
    {
        let SceneName = this.SceneNameNode.string;
        if(SceneName){
              cc.log("loading ",SceneName); 
              cc.director.loadScene(SceneName);
        }
    },
    // update (dt) {},

    login(){
        if(true){
            cc.director.loadScene('MainMenu');
        }
    },
});
