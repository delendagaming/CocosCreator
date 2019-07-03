// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

var sc = this ;

cc.Class({
    extends: cc.Component,
    ctor : function(){
        var ButtonPool ;
    },

    properties: {

        ActionPrefab : cc.Prefab, //the type of button to display
        ActionsLayout :cc.Layout, //the node containing the actions possibles
        _ActionsButtons : null ,
        _PlayerInfo : cc.node,
        TextDisplay : cc.Label, //the ui node where the text will generally appear
        TextParagraphes : cc.string, //the text itself
        BackgroundImage : cc.Node, //the principale image
        testJson : cc.JsonAsset ,

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
        this.ButtonPool = new cc.NodePool();
        let initcount = 10 ;
        for (let i = 0 ; i < initcount ; i++) //instentiate initial pool
        {
            let button = cc.instantiate(this.ActionButton);
            this.ButtonPool.put(button) ;
        }

        this.node.on('Effect',this.NewEvent,this);
        this.node.on("Destroyed",this.NewEvent,this) ;
        this.node.on("TurnState",this.NewEvent,this) ;

    },

    start () {
        for(let lol in this.testJson.json){
            
        cc.log('Json ?',lol);
        }
    }

    ,HideAll(){
        for (n of UiNodes)
        {
            n = cc.hide;
        }
    }


    ,ShowNode(){
        for (let argument of arguments)
        {
            argument = cc.show();
        }
    }

    ,RegisterNode(){
        this.UiNodes.push()
    }

    ,DisplayGamesActions(Holder)
    {
        var layout, playersc = Holder.getComponent('FighterScript') ;
        if(this.ActionsLayout){layout = this.ActionsLayout ;}
        else{layout = cc.find("ActionsLayout",this.node) ;}
        
        for(let i = 0 ; i < playersc._PossiblesActions.length ; i++) //Bound action to the buttones
        {
            cc.log('action ?' , playersc._PossiblesActions[i].DisplayName);
            let b = layout.node.children[i] ; //register the button node
            let eh = new cc.Component.EventHandler();
            b.active = true ;
            b.children[0].getComponent(cc.Label).string = playersc._PossiblesActions[i].DisplayName ;

            eh.target = Holder;
            eh.component = 'FighterScript' ;
            eh.handler = 'ExecuteAction';
            eh.customEventData = playersc._PossiblesActions[i].DisplayName ;
            b.getComponent(cc.Button).clickEvents.push(eh) ;
        }
/*
        if(layout)
        {
            for(var action in holder.PossiblesActions[])
            {

            }
        }*/
        
    }

    ,DisplayPlayerinfo(player)
    {
        let playersc = player.getComponent('FighterScript');
        cc.log('displaying user info ', playersc._PossiblesActions.length) ;
        for(let i = 0 ; i < playersc._PossiblesActions.length ; i++)
        {
            cc.log('action ?' , playersc._PossiblesActions[i].DisplayName);
            var b = cc.instantiate(cc.button);
            this.GameActionsLayout.addChild(b);
        }
        //this.com
    }

    ,ChangeDisplayText(text)
    {
        this.TextDisplay.string += 
            '\n' 
            + text.toString()
    },

    ChangeParagraph(NewParagraph) //take a paragraph object and display it text adn/or image
    {
        this.ChangeDisplayText(NewParagraph.text) ; 
        if(NewParagraph.BackgroundImage)
        {
            this.BackgroundImage
        }
    },

    NewEvent(ev){ //triggered for all sorts of events
        
        
        switch(ev.type){
            case 'Effect':
            this.ChangeDisplayText(ev.target.getComponent('FighterScript').DisplayName + ' got hit for '+ev.detail);
            break;
            case 'TurnState':
            this.ChangeDisplayText(ev.target.getComponent('FighterScript').DisplayName+"'s turn " + ev.detail);
            break;
            case 'Destroyed':
            this.ChangeDisplayText(ev.target.getComponent('FighterScript').DisplayName + ' is destroyed ! ');
            this.ChangeDisplayText('end of the fight');

            break;
        }

        
    },
    // update (dt) {},
});
