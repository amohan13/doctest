var fs=require('fs');
var natural = require('natural');



//defining the object for json
var result={};
result['base_document']={};
result['test_document']={};
result['match']={};
result['spell']={};

//variables for base documents
var baseNounCount=0;
var baseVerbCount=0;
var baseAdjCount=0; 

//variables for test documents
var testNounCount=0;
var testVerbCount=0;
var testAdjCount=0; 


var path = require("path");
var base_folder = path.join(path.dirname(require.resolve("natural")), "brill_pos_tagger");
var rulesFilename = base_folder + "/data/English/tr_from_posjs.txt";
var lexiconFilename = base_folder + "/data/English/lexicon_from_posjs.json";
var defaultCategory = 'N';
var lexicon = new natural.Lexicon(lexiconFilename, defaultCategory);
var rules = new natural.RuleSet(rulesFilename);
var tagger = new natural.BrillPOSTagger(lexicon, rules);
var tokenizer = new natural.WordTokenizer();


//base file read and counting all nouns verbs etc
var basedata = fs.readFileSync('./base.txt', 'utf8');
var baseword= wordCount(basedata);
var baseTokens=tokenizer.tokenize(basedata);
var tokenbase=basedata.split(/\W+/);
     console.log("Number Of words in base file Are: "+baseword);
var newbasedata=tagger.tag(baseTokens);
for(var i=0; i<newbasedata.length; i++){
    if(newbasedata[i][1]=='NN'||newbasedata[i][1]=='NNP'||newbasedata[i][1]=='NNPS'||newbasedata[i][1]=='NNS')
      baseNounCount++;
    if(newbasedata[i][1]=='VB'||newbasedata[i][1]=='VBD'||newbasedata[i][1]=='VBG'||newbasedata[i][1]=='VBP'||newbasedata[i][1]=='VBN'||newbasedata[i][1]=='VBZ')
      baseVerbCount++;  
    if(newbasedata[i][1]=='JJ'||newbasedata[i][1]=='JJR'||newbasedata[i][1]=='JJS')
      baseAdjCount++;   
  }
    console.log( "noun in base file are "+baseNounCount);
    console.log("verb in base file are "+ baseVerbCount);
    console.log( "adjective in base file are "+baseAdjCount);



//Pushing the result in json object 
result.base_document['word_count']=baseword;
result.base_document['noun_count']=baseNounCount;
result.base_document['verb_count']=baseVerbCount;
result.base_document['adjective_count']= baseAdjCount;

//test file read and counting all nouns verbs etc
var testdata= fs.readFileSync('./test.txt', 'utf8');
var testTokens=tokenizer.tokenize(testdata);
var testword= wordCount(testdata);
if(testword>=baseword-500 || testword<=baseword+500){
    console.log("Number Of words in test file: "+testword);
}

//calling match function
matching(baseTokens,testTokens);
var newtestdata=tagger.tag(testTokens);
for(var i=0; i<newtestdata.length; i++){
    if(newtestdata[i][1]=='NN'||newtestdata[i][1]=='NNP'||newtestdata[i][1]=='NNPS'||newtestdata[i][1]=='NNS')
      testNounCount++;
    if(newtestdata[i][1]=='VB'||newtestdata[i][1]=='VBD'||newtestdata[i][1]=='VBG'||newtestdata[i][1]=='VBP'||newtestdata[i][1]=='VBN'||newtestdata[i][1]=='VBZ')
      testVerbCount++;  
    if(newtestdata[i][1]=='JJ'||newtestdata[i][1]=='JJR'||newtestdata[i][1]=='JJS')
      testAdjCount++;   
  }
      console.log( "noun in test file are "+testNounCount);
      console.log("verb in test file are "+ testVerbCount);
      console.log( "adjective  in test file are "+testAdjCount);

//Pushing the result in json object 
result.test_document['word_count']=testword;
result.test_document['noun_count']=testNounCount;
result.test_document['verb_count']=testVerbCount;
result.test_document['adjective_count']= testAdjCount;
//word count function
function wordCount(str){
	return str.split(/\W+/).length;
}



//matching percentage of files
function matching(tokenbase,tokentest){
	var non_matching=0;
    var matching=0;
    for (var i = 0; i < tokenbase.length; i++)
    {
	              
        if(tokenbase.indexOf(tokentest[i],0)===-1)
            { 
               non_matching++;
            }
    }  
    for (var i = 0; i < tokentest.length; i++)
    {
	              
        if(tokentest.indexOf(tokenbase[i],0)===-1)
            { 
                matching++;
            }

    }  
       var match_result=((non_matching-matching)/non_matching)*100
       console.log("Matched: "+match_result);
       result.match['matching']=match_result;
}
 

//matching the base part with dictionary
var dictionary=fs.readFileSync('./dictionary.txt','utf8');
var split_dic=dictionary.split(/\W+/);
var same_keys_test=0,same_keys_base=0;
for(var j=0;j<split_dic.length;j++){
    for(var i=0;i<testTokens.length;i++){
		if(split_dic[j]==testTokens[i]){
			same_keys_test++;
		}
    if(split_dic[j]==baseTokens[i]){
      same_keys_base++;
    }
	}
}
console.log("spelling: "+ same_keys_base);
result.spell['same_keys_in_base']=same_keys_base;
result.spell['same_keys_in_test']=same_keys_test;

    var json= JSON.stringify(result,null,2);
    fs.writeFile('output.json',json,'utf8',(err)=>{
		if(err){
			console.log("Error "+err);
			return;
		};
    console.log(result);

    });
	
