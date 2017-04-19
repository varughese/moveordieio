package Exporter{
	
	/**
	 * ...
	 * @author Omar Shehata, contact@4urentertainment.org
	 */
	
	
    public class XML2JSON {
     
	
	private var sp;
	private var STR:String;
	private var myXML:XML;
	private var iter;
	private var arrays;
	private var tempArray;
	
	private function isArray(name:String,arr:Array):Boolean {
		for (var i:int = 0; i < arr.length; i++) {
			if (name == arr[i]) {
				return true;
				}
			}
		return false
		}
	
	private function FindArrays(xml) {
		var len = xml.children().length()
			if (isArray(xml.name(),tempArray) == false) {
				tempArray.push(xml.name())
				}
			else if (isArray(xml.name(),tempArray) == true && isArray(xml.name(),arrays) == false) {
				arrays.push(xml.name())
				}
			for (var i:int = 0; i < len; i++) {
				FindArrays(xml.children()[i])
			}
		}
		
	private function ConvertToJSON(xml) {
		var len = xml.children().length()
		iter ++
		if(len != 0){
			sp += "   ";			
			if (!isArray(xml.name(),arrays)) {	
			Append(sp + '"' + xml.name() + '"' + ": {")
			}
			else {
				Append(sp + "{")
				}
			
			for(var j2:int = 0;j2<xml.attributes().length();j2++){
				var ad = ","
				Append("   " + sp + '"' + "-" + xml.attributes()[j2].name() + '"' + ":" + '"' + xml.attributes()[j2] + '"' + ad)
				}
			if (isArray(xml.children()[0].name(),arrays)) {
				Append(sp + '"' + xml.children()[0].name() + '"' + ": [")
				}
			for (var i:int = 0; i < len; i++) {
				ConvertToJSON(xml.children()[i])
				if(i != len-1){
					STR += ","
					}
				}
			
			if (isArray(xml.children()[0].name(),arrays)) {
				Append(sp + "]")
			}
				
			Append(sp + "}")
			sp = sp.slice(0,sp.length-3)
			}
		if (len == 0) {
			if (!isArray(xml.name(),arrays)) {	
			Append(sp + '"' + xml.name() + '"' + ": {")
			}
			else {
				Append(sp + "{")
				}
			for(var j:int = 0;j<xml.attributes().length();j++){
				var ada = ","
				if(j == xml.attributes().length()-1) ada = ""
				Append("   " + sp + '"' + "-" + xml.attributes()[j].name()+ '"' + ":" + '"' + xml.attributes()[j] + '"' + ada)
				}
			Append(sp + "}")
			
			}
		}
		
	private function Append(s:String){
	STR += "\n" + s;
	}
	
	public function Conversion(xml):String {
		STR = "";
		sp = ""; iter = 0; arrays = [];
		tempArray = [];
			myXML = xml
			Append("{")
			FindArrays(myXML)
			ConvertToJSON(myXML)
			Append("}")
			return STR;
		}
		
		
	
	
    }
     
}