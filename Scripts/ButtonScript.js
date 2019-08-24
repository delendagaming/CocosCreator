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
        
        choiceEvent : cc.Event.EventCustom,
        eventType : 'Choice',
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

    Choice(event , customEventData){
        cc.log('choice script test') ;
        this.node.dispatchEvent(this.choiceEvent,true);
    },
    SetEvent(choice)
    {
        cc.log('setting event ',choice.type);
        var detail = new cc.Object();
        detail.owner = 'player' ;
        switch(choice.type){
            case 'dialogue':
                detail.id = choice.depthNumber +'-'+ choice.paragraphNumber;
                detail.type = 'GoToPage';
                cc.log('event dialogue ?',detail.type);
                break ;
            case 'narration':
                detail.id = choice.depthNumber +'-'+ choice.paragraphNumber;
                detail.type =  'GoToPage';
                break ;
            case 'riddle':
                detail.id = choice.depthNumber +'-'+ choice.paragraphNumber;
                detail.type =  'GoToPage';
                break ;
            case 'path':
                detail.id = choice.depthNumber +'-'+ choice.paragraphNumber;
                detail.type =  'GoToPage';
                break ;
            case 'combat':
                detail.id = choice.depthNumber +'-'+ choice.paragraphNumber;
                detail.type =  'GoToPage';
                break;
            case 'action': cc.log('combat action ?'); 
                detail.id = choice.name;
                detail.type =  choice.type;
                this.node.children[0].getComponent(cc.Label).string = detail.id;
                break;
        }
        cc.log('setting event detail ',detail.type);
        this.choiceEvent = new cc.Event.EventCustom("Choice" , true);
        this.choiceEvent.detail = detail ;
    }
    // update (dt) {},
});
