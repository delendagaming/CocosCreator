// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html
var UIScript = null ;

cc.Class({
    extends: cc.Component,

    properties: {
        
        dataEvent : cc.Event.EventCustom,
        eventType : 'Choice',
        owner : null ,
        audio:{
            default : null,
            type : cc.AudioClip,
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
        UIScript = cc.find('Canvas').getComponent('UI_Master');
        cc.log('button : ui script found ? ', UIScript);
        this.dataEvent = new cc.Event.EventCustom(this.eventType , true);/*
        var detail = new cc.Object();
        detail.type = this.eventType ;
        //this.dataEvent.detail = detail ;*/
     },

    start () {
    },

    DispatchChoice(event , customEventData){
        cc.log('click', this.dataEvent);
        //this.current = cc.audioEngine.play(this.audio, false, 1);
        this.node.dispatchEvent(this.dataEvent,true);
    },

    Validated(event , customEventData){
        UIScript.ShowMenu(customEventData);
    },
    
    SetButton(data)
    {
        cc.log(this.node.name ,' setting button event : ',data.type);
        var detail = new cc.Object();
        detail.owner = 'player' ;
        if(data.hasOwnProperty('name')){
            this.name = data.name;
        };
        if(data.hasOwnProperty('text')){
            this.node.getChildByName('Label').getComponent(cc.Label).string = data.text ;
        };
        if(data.hasOwnProperty('outcomeText')){
            this.node.getChildByName('Label').getComponent(cc.Label).string = data.outcomeText ;
        };
        cc.log('button script 1');
        
        if(data.hasOwnProperty('outcomeImageURLonIPFS')){
            var n = this.node ;
            cc.loader.load({url:data.outcomeImageURLonIPFS,type:'png'}, function (err, texture) {
                if(err){
                    cc.log('button texture failed to load');
                };
                if(texture){
                    
                    let frame = n.getComponent(cc.Sprite);
                    frame.spriteFrame = new cc.SpriteFrame(texture);
                    cc.log(frame.spriteFrame.getTexture,' compo? ',n );
                };
            });
        };
        if(data.hasOwnProperty('outcomeSoundURLonIPFS')){
            var n = this.node ;
            cc.loader.load(data.outcomeSoundURLonIPFS,function (err, audio) {
                if(err){
                    cc.log('audio not loading : ',err.message);
                };
                if(audio){this.audio = audio};
            });
        };
        if(data.hasOwnProperty('sound')){
            cc.loader.load(data.sound,function (err, audio) {
                if(err){
                    cc.log('audio not loading : ',err.message);
                };
                if(audio){this.audio = audio};
            });
        };
        if(data.hasOwnProperty('nextIndex')){
            detail.nextIndex = data.nextIndex ;
        };
        if(data.hasOwnProperty('Index')){
            detail.Index = data.Index ;
        };
        if(data.hasOwnProperty('action')){
            this.node.children[0].getComponent(cc.Label).string = data.action;
            detail.action = data.action ;
        };
        cc.log('button script 2');
        if(data.hasOwnProperty('owner')){
            this.owner = data.owner ;
            detail.owner = data.owner ;
        };
        if(data.hasOwnProperty('type')){
            detail.type = data.type ;
        };
        
        cc.log('button script 3');
        if(data.hasOwnProperty('selectedPointer')){
            
            //not great
            this.node.parent = this.node.parent.parent.getChildByName('ImageDisplay');
            
            this.node.setPosition(data.selectedPointer.left,data.selectedPointer.top);
            cc.log(this.node.x,' display image ?',this.node.y);
        };

        
        this.dataEvent = new cc.Event.EventCustom(this.eventType , true);
        this.dataEvent.detail = detail ;
        cc.log('setting event detail ',detail.type , this.dataEvent.type);
    }
    // update (dt) {},
});
