// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var UiScript = null ;

cc.Class({
    extends: cc.Component,

    properties: {
        
        dataEvent : cc.Event.EventCustom,
        eventType : 'choice',
        owner : null ,
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

    // onLoad () {},

    start () {
    },

    Validated(event , customEventData){
        cc.log('click');
        this.node.dispatchEvent(this.dataEvent,true);
    },
    SetButton(data)
    {
        cc.log('setting button event : ',data.type);
        var detail = new cc.Object();
        detail.owner = 'player' ;
        if(data.hasOwnProperty('name')){
            this.node.getChildByName('Label').getComponent(cc.Label).string = data.name ;
        };
        if(data.hasOwnProperty('nextIndex')){
            detail.nextIndex = data.nextIndex ;
        };
        if(data.hasOwnProperty('action')){
            this.node.children[0].getComponent(cc.Label).string = data.action;
            detail.action = data.action ;
        };
        if(data.hasOwnProperty('owner')){
            this.owner = data.owner ;
            detail.owner = data.owner ;
        };
        if(data.hasOwnProperty('type')){
            detail.type = data.type ;
        };
        if(data.hasOwnProperty('imageURL')){
        };
        if(data.hasOwnProperty('top')){
            this.node.setPosition(data.left,data.top);
        };

        cc.log('setting event detail ',detail.type);
        this.dataEvent = new cc.Event.EventCustom("Choice" , true);
        this.dataEvent.detail = detail ;
    }
    // update (dt) {},
});
