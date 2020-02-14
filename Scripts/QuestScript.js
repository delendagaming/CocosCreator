//import { load } from "grpc";

// Learn cc.Class:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://docs.cocos2d-x.org/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] https://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

var oLoadedQuest = {} ;
var oParagraphsHolder = {} ;
var oChoicesHolder = [];
var nCurrentIndex ;
var aButtonsHolder = [] ;
var aIconsHolder = [] ;
var bChoiceValided = false;
var combatClass = require('CombatScript');

cc.Class({
    extends: cc.Component,

    properties: {
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

        imageDisplay : cc.Node ,
        choiceHolder : cc.Node,
        healthBar : cc.ProgressBar,
        ennemyHealthBar : cc.ProgressBar,
        questJSON : cc.JsonAsset ,
        currentIndexDisplay : cc.Label ,
        Title : cc.RichText ,
        NarrationText : cc.RichText,
        journalNode : cc.Node ,
        buttonPrefab: cc.Prefab,
        journalEntryPrefab : cc.Prefab,
        journal : [] ,
        maxButtons : 8 ,
        combat : combatClass ,

        endWindow : cc.Node ,

        isInCombat : false ,

    },

    // LIFE-CYCLE CALLBACKS:

     
    onLoad () {
        for (let i = 0; i< this.maxButtons ; i++){
        }
        //this.endWindow.active = false ;
    },

    start () {
        cc.log('starting quest');
        oLoadedQuest = this.questJSON.json ;
        this.loadParagraphs(oLoadedQuest.Paragraphs);
        this.goToParagraph(0,1);


    },

    loadParagraphs(paragraphs){//this register the quest paragraphs and preload the required asset
        
        var firstpage = {};
        var temp = {} ;
    
        //create a copy of the json paragrapgh
        for (var paragraph of paragraphs){
            cc.log('depth',paragraph.depthNumber,paragraph.paragraphNumber);
            var page = {
                index : paragraph.depthNumber.toString() +'-'+ paragraph.paragraphNumber.toString(),
                title : paragraph.Title,
                inputText : paragraph.inputText,
                paragraphType : paragraph.paragraphType,
                paragraphSubTypes : paragraph.paragraphSubTypes,
                subtypes : paragraph.paragraphSubTypes,
                nextParagraphs : paragraph.nextParagraphs.slice(0) ,
                currentChoices : [],
                backgroundImage : paragraph.backgroundImageURL,
                selectedMonster : paragraph.selectedMonster,
                currentMonsters : [],
            } ;

            if(page.backgroundImage != undefined){
                cc.loader.load({url:'page.image',type:'png'}, function (err, texture) {
                    if(err){
                        cc.log('texture not loading for : ',err.message);
                    };
                    if(texture){
                        cc.log('texture loaded',texture);
                        page.loadedImage = texture;
                    };
                });
            }

            //set up the encounters
            if(page.selectedMonster){page.currentMonsters.push(this.combat.AddFighter(paragraph.selectedMonster))};
            

            //set the different choices the player can make in the quest
            this.setupChoices(page.nextParagraphs)
            cc.log('test subtype',page.paragraphSubTypes);

            if(page.paragraphSubTypes.isSuddenDeath ){
                page.nextParagraphs.push( 
                    {type :'restart',outcomeText:'restart'},
                    {type :'quit',outcomeText:'quit'},
                );
            };

            if(page.paragraphSubTypes.isVictory ){
                page.nextParagraphs.push( 
                    {type :'restart',outcomeText:'restart'},
                    {type :'quit',outcomeText:'quit'},
                );
            };

            page.test = this.test.bind(null,'lollol');


            //index the paragrah
            oParagraphsHolder[page.index] = page;
            
        }
        this.Title.string = oLoadedQuest.Title;

    },

    setupChoices(paragraphs){

        for(let choice of paragraphs )
        {
            cc.log('keys',Object.keys(choice));
            cc.log('setting choice',choice.depthNumber,choice.paragraphNumber);
            
            if(choice.hasOwnProperty('outcomeImageURLonIPFS')){
                cc.loader.load({url:choice.outcomeImageURLonIPFS,type:'png'}, function (err, texture) {
                    if(err){
                        cc.log('texture not loading for ',page.id,' : ',err.message);
                        
                    };
                    if(texture){
                        cc.log('texture loaded',texture);
                        choice.loadedImage = texture
                    };
                });
            }

            if(choice.hasOwnProperty('selectedPointer')){
                cc.log('setting choice lolol',choice.selectedPointer);
                cc.loader.load({url:choice.selectedPointer.image,type:'png'}, function (err, texture) {
                    if(err){
                        cc.log('texture not loading for pointer : ',err.message);
                    };
                    if(texture){
                        cc.log('texture loaded',texture);
                        choice.loadedImage = texture;
                    };
                });

            }
            //paragraph.action = function(){cc.log('hello')}
        }

    },

    Action(button, lol){
        cc.log('bbbb',button.getComponent('TestButton').choiceNumber);
    },

    goToParagraph(depth , number){
        cc.log('going to paragraph ',nCurrentIndex);


        //set the current paragraph
        nCurrentIndex = depth.toString() + '-' + number.toString();
        var currentParagraph = oParagraphsHolder[nCurrentIndex] ;
        currentParagraph.test()

        //display the paragraph text
        this.addToJournal(oParagraphsHolder[nCurrentIndex].inputText);
        //this.NarrationText.string = oParagraphsHolder[nCurrentIndex].inputText;

        if(currentParagraph.hasOwnProperty('loadedImage')){
            cc.log('loading image for paragraph ',currentParagraph.index);
            this.imageDisplay.getComponent(cc.Sprite).spriteFrame  = new cc.SpriteFrame(currentParagraph.loadedImage);
        };

        //display the paragraph number
        this.currentIndexDisplay.string = nCurrentIndex;

        //change the buttons to fit the possibles choices
        this.showChoices(oParagraphsHolder[nCurrentIndex],oParagraphsHolder[nCurrentIndex].nextParagraphs);

        switch(currentParagraph.paragraphType){
            case 'combat' : 
                cc.log('going to fight');
                //register what to do when fight end
                this.node.on('endOfFight',function (isVictory){
                    cc.log('receving end of fight',isVictory);
                    if(isVictory){
                        this.resume();
                    }
                    else{this.goToParagraph(1,1)}
                },this);
                this.hideChoices();
                this.combat.SetPageFight(oParagraphsHolder[nCurrentIndex]);
                break;

            case 'dialogue' : 
                break;

            case 'riddle' :
                break ;
            
            case 'narration' :
                break ;

        }
    },

    hideChoices(){
        for(let i = 0; i < aButtonsHolder.length; i++){
            aButtonsHolder[i].active = false ;

        }

    },

    showChoices(paragraph,choices){
        //cleanup
        for(let i = 0; i < aButtonsHolder.length; i++){
            aButtonsHolder[i].parent = null ;
        };
        aButtonsHolder = [];

        var currentDisplayNode = this.choiceHolder;

        for(let i = 0; i < choices.length; i++){

            choices.test = function(){cc.log('testing the function')};
            var buttonNode = cc.instantiate(this.buttonPrefab) ;
            aButtonsHolder.push(buttonNode);
            
            if (i < choices.length){ //if we havent set all the choices yet

                buttonNode.active = true ;
                buttonNode.getComponent('TestButton').choiceNumber = i ; //register which choice the button will select in given choices[]
                buttonNode.on('click',this.receiveChoice,this);

                //various display change to the button
                //change the button text
                if(choices[i].hasOwnProperty('outcomeText')||choices[i].hasOwnProperty('text')){
                    cc.find('Label',buttonNode).getComponent(cc.Label).string = choices[i].outcomeText ;
                }
                else{
                    //cc.find('Label',buttonNode).getComponent(cc.Label).string = 'nothing';
                };

                //change the button sprite
                if(choices[i].hasOwnProperty('loadedImage')){
                    buttonNode.getComponent(cc.Sprite).spriteFrame  = new cc.SpriteFrame(choices[i].loadedImage)  ;
                }
                else{
                    //buttonNode.getComponent(cc.Sprite).spriteFrame  = null ;
                };

                //change where the button is displayed
                if(choices[i].hasOwnProperty('selectedPointer')){
                    currentDisplayNode = this.imageDisplay;
                    buttonNode.setPosition(choices[i].selectedPointer.left,choices[i].selectedPointer.top);

                }
                else{

                };
                buttonNode.parent = currentDisplayNode ;
            }
            else{ //once the choices are set hide the surplus buttons
                buttonNode.active = false ;
            }
        }
    },

    hold(){
        this.hideChoices();
    },

    resume(){
        this.showChoices(null,oParagraphsHolder[nCurrentIndex].nextParagraphs);
    },

    addToJournal(newText){ //
        if(this.journalEntryPrefab){
            var entryNode = cc.instantiate(this.journalEntryPrefab);
            var entry = {
                text : newText,
                date : new Date() ,
            };
            this.journal.push(entry);

            entryNode.getComponent(cc.Label).string = entry.date.getHours()+' : '+entry.date.getMinutes()+' : '+entry.date.getSeconds()+" - "+entry.text ;
            this.journalNode.addChild(entryNode);


        }
        else{
            cc.log('no prefab set for journal');
        };
        
        
    },

    refreshJournal(){

    },

    clearJournal(){
        this.journal = [];
        for(let child of this.journalNode.children){
            child.parent = null ;
            cc.loader.release(child);
        }
    },

    restart(){
        cc.log('restarting');
        //load the same scene
        cc.director.loadScene(cc.director.getScene().name);
        
        //this.unload();
        //this.start();

    },

    unload(){
        this.clearJournal();
        oLoadedQuest = null ;
        oChoicesHolder = [] ;
        oParagraphsHolder = {};
        aButtonsHolder = [] ;

    },

    quit(){
        cc.log('quitting');
        //this.unload();
        cc.director.loadScene('QuestMap');
    },

    showEndWindow(){
        this.endWindow.active = true ;

    },

    receiveChoice(event){
        this.verifyContract();
        
        var currentParagraph = oParagraphsHolder[nCurrentIndex];
        //depending on the current paragraph and wich choice is made

        if(currentParagraph.paragraphSubTypes.isSuddenDeath == true ){
            
            var next = currentParagraph.nextParagraphs[event.choiceNumber];
            if(next.type == 'restart'){this.restart()};
            if(next.type == 'quit'){this.quit()};
            return;
            
        };

        if(currentParagraph.paragraphSubTypes.isVictory == true ){
            cc.log('victory');
            var next = currentParagraph.nextParagraphs[event.choiceNumber];
            if(next.type == 'restart'){this.restart()};
            if(next.type == 'quit'){this.quit()};
            return;
            
        };

        if(currentParagraph.paragraphType == "narration"||currentParagraph.paragraphType == "riddle"||currentParagraph.paragraphType == 'dialogue'){
            let next = oParagraphsHolder[nCurrentIndex].nextParagraphs[event.choiceNumber];    
            this.goToParagraph( next.depthNumber,next.paragraphNumber );
            return;
        };

        if(currentParagraph.paragraphType =='combat' ){
            if(this.isInCombat == false){
                let next = currentParagraph.nextParagraphs[event.choiceNumber]; 
                this.goToParagraph( next.depthNumber,next.paragraphNumber);
            }
            else{
            }
            return;
        };

        if(currentParagraph.paragraphType =='path' ){
            let next = oParagraphsHolder[nCurrentIndex].nextParagraphs[event.choiceNumber]; 
            this.goToParagraph( next.depthNumber,next.paragraphNumber);
            return;
        };


        
        //this.goToParagraph( next.depthNumber,next.paragraphNumber);

    },

    verifyContract(){

    },

    test(){
        for (let arg of arguments)
        cc.log('testing',arg);
    },

    // update (dt) {},
});
