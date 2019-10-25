// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


var questLogs = [];
var pagesHolder = new cc.Object() ;

cc.Class({
    extends: cc.Component,

    properties: {

        ButtonPrefab : cc.Prefab, //the type of button to display
        pagesDisplay :cc.Node, //the node containing the instantiated pages ;
        
        PagePrefab : cc.Prefab ,
        currentPage : cc.Node ,
        TestQuest : cc.JsonAsset , //
        GameActionDatabase : cc.JsonAsset,
        PopupText : cc.Prefab ,
        

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
        this.PopupText = cc.instantiate(this.PopupText) ;
        for (let i = 0 ; i < initcount ; i++) //instentiate initial pool
        {
            let button = cc.instantiate(this.ActionButton);
            this.ButtonPool.put(button) ;
        }
        this.node.on('Choice',this.ReceiveChoiceEvent,this);
        this.node.on('Effect',this.ReceiveEffectEvent,this);

    },

    start () {
        if(this.TestQuest){this.LoadQuest(this.TestQuest.json);}
        else{cc.warn('json quest file not loaded')}
        
    },

    LoadQuest(Quest){ //load all the possibles pages from a quest object
        cc.log("loading quest " , Quest.id);
        pagesHolder = new cc.Object() ;

        for(let paragraph of Quest.Paragraphs) //for each paragraph of the quest create a corresponding page object
        {
            this.SetPage(paragraph);
        }

        //create the presentation page
        var firstChoice = {
            depthNumber : 0,
            paragraphNumber : 1,
        };
        var firstParagraph = {
            depthNumber : 0,
            paragraphNumber : 0,
            paragraphType : 'narration',
            paragraphSubTypes : {
                isEliteMobCombat: false,
                isFinalBossCombat: false,
                isGraphicalRiddle: false,
                isMobCombat: false,
                isPointAndClickPath: false,
                isSuddenDeath: false,
                isTextualPath: false,
                isTextualRiddle: false,
                isVictory: false
              },
            inputText :'quest : '+  Quest.Title  +'\n'+' creation date : ' +Quest.CreationDate,
            nextParagraphs : [firstChoice],
        };

        this.currentPage = this.SetPage(firstParagraph);
        this.currentPage.displayNode.active = true ;
        cc.log('first page ', this.currentPage.index);
    },

    UnloadQuest(){
        pagesHolder = null;
        this.currentPage = null;

    },

    SetPage(paragraph){
        //this function create an usable 'page' object from a given paragraph.

        //initialize the page object
        var page = {
            index : paragraph.depthNumber.toString() +'-'+ paragraph.paragraphNumber.toString(),
            title : paragraph.Title,
            displayNode : cc.instantiate(this.PagePrefab),//instantiate a page prefab, it's what will appear on screen
            inputText : paragraph.inputText,
            type : paragraph.paragraphType,
            subtypes : paragraph.paragraphSubTypes,
            choices : paragraph.nextParagraphs ,
            currentChoices : [],
            backgroundImage : paragraph.backgroundImageURLonIPFS,
            selectedMonster : paragraph.selectedMonster,
            currentMonsters : [],
        } ;

        if(page.subtypes.isEliteMobCombat){};
        if(page.subtypes.isFinalBossCombat){};
        if(page.subtypes.isMobCombat){};
        if(page.subtypes.isSuddenDeath){

        };
        if(page.subtypes.isTextualPath){};
        if(page.subtypes.isTextualRiddle){};
        if(page.subtypes.isVictory){};
        if(page.subtypes.isPointAndClickPath){};

        //add the page to the container node
        this.pagesDisplay.addChild(page.displayNode) ; 
        page.displayNode.active = false ;

        //set the text in the page nodes
        page.displayNode.getChildByName('TextDisplay').getComponent(cc.Label).string = paragraph.inputText ; 
        page.displayNode.getChildByName('TitleDisplay').getComponent(cc.Label).string =  page.index ;

        for(let choice of page.choices)
        {

            if(choice.hasOwnProperty('depthNumber'))
            {
                choice.nextIndex = choice.depthNumber.toString() +'-'+ choice.paragraphNumber.toString()
                choice.name = choice.nextIndex;
                choice.type = 'GoToPage';
            }  
        };

        //create the paragraph fighters if they exists
        if(typeof page.selectedMonster !== 'undefined'){
            cc.log(page.selectedMonster,' selected monster');
            this.node.getComponent('Fight_Master').AddFighter(page,page.selectedMonster )
        };

        //load the background image
        if(page.backgroundImage!== null){
            cc.log( 'loading texture ',page.backgroundImage );
            cc.loader.load({url:page.backgroundImage,type:'png'}, function (err, texture) {
                if(err){
                    cc.log('texture not loading for ',page.index,' : ',err.message);
                };
                if(texture){page.displayNode.getChildByName('ImageDisplay').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);};
                // Use texture to create sprite frame
            });
            //page.displayNode.getChildByName('Background').getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
        }

        

        //if there is specifics things to set given the type of paragraph
        cc.log('setting page : ',page.index,' ',page.type);
        switch(paragraph.paragraphType){
            case 'dialogue':
                break ;
            case 'narration':
                break ;
            case 'path':
                break ;
            case 'riddle':
                break ;
            case 'combat':
                cc.warn('adding monster');
                break;
        }

         
         
         //create the buttons/choices the player has to make
         this.SetChoices(page , page.choices); //create the buttons using the "next paragraphs" options

        //register the created page
        pagesHolder[page.index] = page ; //register the page with the key as attribute for easy access*/
        return page ;
    },

    SetChoices(page ,choiceList) //take a list of choice for a given page and create buttons to execute them. this is the main function for buton logic
    {
        var choicesLayout = page.displayNode.getChildByName('ChoicesLayout'); 
        var imageDisplay = page.displayNode.getChildByName('ImageDisplay'); 
        
        //remove all the previous choices for the selected page
        for(let i = 0; i < page.currentChoices.length; i++){page.currentChoices[i].displayNode.destroy();}
        page.currentChoices = [];
        
        //create the choices button
        for (let choice of choiceList)
        {
            //create node button from template
            cc.log('setting choice ',choice,choice.type,' for page ',page.index);
            choice.displayNode = cc.instantiate(this.ButtonPrefab);
            if(choice.hasOwnProperty('top')){imageDisplay.addChild(choice.displayNode)} //
            else{choicesLayout.addChild(choice.displayNode)};
            choice.displayNode.getComponent('ButtonScript').SetButton(choice);
            choice.displayNode.active = true;   
            page.currentChoices.push(choice) ; //for now there is no identifiant for choie player make
        }
        
    },

    AddChoice(page, choice){
        var choicesLayout = page.displayNode.getChildByName('ChoicesLayout'); 
        var choicebutton = cc.instantiate(this.ButtonPrefab); //create node button from template
        choicesLayout.addChild(choicebutton) ; //add it to the paragraph layout
        choicebutton.getComponent('ButtonScript').SetButton(choice);
    },

    SetText(page,text){
        page.displayNode.getChildByName('TextDisplay').getComponent(cc.Label).string = text ;
    },

    

    GoToPage(newPageName) //change the current displayed page
    {
        cc.log("going to paragraph ",newPageName);       
        cc.log("old paragraph ",this.currentPage.index);

        if(pagesHolder.hasOwnProperty(newPageName)){
            this.currentPage.displayNode.active = false ; //hide the current page before getting to the new one
            cc.log("new paragraph ",pagesHolder[newPageName].nextIndex);
            this.currentPage = pagesHolder[newPageName]; //register new page as current one
            this.currentPage.displayNode.active = true ; //show the newpage

            var log = {
                type : pagesHolder[newPageName].type,
                text : pagesHolder[newPageName].inputText
            }
        questLogs.push(log);

        }
        

        //triggers relative to the event happening on the new page
        switch(pagesHolder[newPageName].type){
            case 'dialogue':
                break ;
            case 'narration':
                break ;
            case 'type':
                break ;
            case 'riddle':
                break ;
            case 'combat':
                this.getComponent('Fight_Master').SetPageFight(pagesHolder[newPageName]);
                break ;
        }
        
        
        
    },

    ReceiveChoiceEvent(event){ //triggered for all sorts of events
        cc.log("receiving event ? ",event.type ,event.detail.type);
        switch(event.detail.type){
            case 'GoToPage':
                this.GoToPage(event.detail.nextIndex);
                break;
            case 'action':cc.log('action event');
                break;
            case 'Reload':
                this.UnloadQuest();
                this.LoadQuest(this.TestQuest.json);
                break;

        }

    },

    ReceiveEffectEvent(event){
        cc.log('displaying event ',event.target);
        var textAnim = this.PopupText.getComponent(cc.Animation);
        textAnim.play().repeatCount = 1;
        this.PopupText.parent = this.node;
        this.PopupText.getComponent(cc.Label).string =  ' '+ event.detail.attributeTargeted + ' : ' + event.detail.finalMagnitude ;
        cc.log(textAnim,' text anim ?')
        var effectAnim = event.target.getComponent(cc.Animation);
        effectAnim.play().repeatCount = 4;



    }
    // update (dt) {},
});
