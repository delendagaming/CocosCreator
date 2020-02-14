// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        Quests : {
            type : cc.JsonAsset , 
            default : [],
        },
        QuestsPrefab : cc.Prefab ,
        PlayButton : cc.Node ,
        DescriptionNode : cc.Node ,
        //
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
        //gs = cc.find('Game').getComponent('PersistentGameScript');
        this.DescriptionNode.active = false ,
        this.LoadQuests();
        this.node.on('SelectQuest',this.SelectQuest,this);
    },

    LoadQuests(){
        cc.log('looking for quest ',this.Quests.length);
        for (let i = 0 ; i < this.Quests.length; i++){
            let QuestPoint = cc.instantiate(this.QuestsPrefab);
            let details = {};
            QuestPoint.parent = this.node.getChildByName('Map') ;

            details.Index = i;
            
            QuestPoint.setPosition(50,50);
            QuestPoint.getComponent('ButtonScript').SetButton(details);
        }
    },

    SelectQuest(event){
        //
        cc.log('quest selected');
        if(event.detail.hasOwnProperty('Index')){
            this.PlayButton.active = true ;
            this.DescriptionNode.active = true ;
            var temp = this.DescriptionNode.getChildByName('Description') ;
            var quest = this.Quests[event.detail.Index].json;
            cc.log(this.Quests[event.detail.Index].json.Title);
            temp.getChildByName('QuestTitle').getComponent(cc.Label).string = quest.Title ;
            cc.log('child ? ',temp.getChildByName('QuestTitle').getComponent(cc.Label).String);
            temp.getChildByName('QuestLevel').getComponent(cc.RichText).string = 'Level : '+quest.Level ;
            temp.getChildByName('QuestSummary').getComponent(cc.RichText).string =quest.Summary ;
            temp.getChildByName('QuestTags').getComponent(cc.RichText).string = quest.Tags ;

            var persistentNode = cc.find('Game') ;
            if(persistentNode){
                persistentNode.getComponent('PersistentGameScript').CurrentQuest = Quests[event.detail.Index];
            }
        }

        
        
    },

    PlayQuest(){
        cc.log('trying to load quest');
        cc.director.loadScene('Quest');
    }


    // update (dt) {},
});
