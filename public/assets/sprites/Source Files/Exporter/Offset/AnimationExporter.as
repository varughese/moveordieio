package Code
{
	import flash.display.BitmapData;
	import flash.display.DisplayObjectContainer;
	import flash.display.MovieClip;
	import flash.filters.ColorMatrixFilter;
	import flash.geom.Matrix;
	import Code.XML2JSON;
	import flash.geom.Rectangle;
	import flash.text.TextField;
	import flash.utils.ByteArray;
	import flash.desktop.NativeApplication;
	import flash.filesystem.File;
	import flash.filesystem.FileMode;
	import flash.filesystem.FileStream;
	
	import flash.net.FileReference;
	import flash.utils.ByteArray;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.display.LoaderInfo
	import flash.utils.getDefinitionByName;
	import flash.utils.getQualifiedClassName;
	
	/**
	 * ...
	 * @author Omar Shehata
	 * www.4urentertainment.org
	 * 
	 * HOW TO USE:
	 * -call init(root) with the argument being the main timeline
	 * -export(mc) takes the movieclip you want, and exports its animation data in JSON
	 * -The movieclip must have at least one labelled frame to indicate the name of the animation
	 * -ALL CHILDREN must be given instance names. This is so that you can sync the animation data with your assets.
	 * (TIP: There's an extension to flash that easily allows you to give a symbol instance names over many frames,
	   instead of having to do it manually: http://bit.ly/dsR9tC )
	 * 
	 * NOTES:
	 * -You can export as XML by outputting "xml" instead. Conversion to JSON is on line 195
	 * -If you have any questions or comments, feel free to contact me at contact@4urentertainment.org
	 * 
	 */
	public class AnimationExporter
	{
		private var label:String = "";
		private var ChildrenArray:Array = [];
		private var Convert:XML2JSON = new XML2JSON();
		private var _filen:String;
		
		public function init(root:DisplayObjectContainer) {
			var myFileName:String;
			var myFileNameArray:Array = new Array();
			var num:Number;
			var thisSWF:String;
			myFileName = root.loaderInfo.url;
			myFileNameArray = myFileName.split("/");
			num = myFileNameArray.length;

			thisSWF = myFileNameArray[num-1];

			thisSWF = (thisSWF.slice(0, thisSWF.indexOf(".")))
			_filen = thisSWF;
			
			root.addEventListener(Event.ENTER_FRAME, D);
			function D(event:Event) {
				try {
				var file:File = File.applicationDirectory.resolvePath( _filen + "-app.xml" );
				var badfile:File = new File( file.nativePath );
				badfile.deleteFile()
				trace("Done!")
				root.removeEventListener(Event.ENTER_FRAME,D)
				}
				catch (e:Error) {

					}
				}
			}
		
		public function export(mc:MovieClip) {
			ChildrenArray = [];
			label = "";
			var data:Array = [];

			for (var f:int = 1; f <= mc.totalFrames; f++) {
				mc.gotoAndStop(f);
				data[f] = [];
			for (var i:int = 0; i < mc.numChildren; i++) {
					var child = mc.getChildAt(i);
				
					var array:Array = [];
					array["x"] = child.x;
					array["y"] = child.y;
					
					var mcopy:MovieClip = new MovieClip();
					mcopy.transform = child.transform;
					mcopy.rotation = 0;
					
					array["scaleX"] = mcopy.transform.matrix.a.toFixed(2);
					array["scaleY"] = mcopy.transform.matrix.d.toFixed(2);
					
					array["rotation"] = child.rotation.toFixed(3);
					array["alpha"] = child.alpha.toFixed(2);
					
					var color:ColorMatrixFilter = new ColorMatrixFilter();
					var colorMatrix:Array = color.matrix;
					if (child.filters[0] is ColorMatrixFilter) {
								colorMatrix = child.filters[0].matrix;
								
								for(var iA:int = 0;iA<colorMatrix.length;iA++){
									colorMatrix[iA] = colorMatrix[iA].toFixed(3)
								}
							}
					array["colorMatrix"] = colorMatrix;
					array["depth"] = mc.getChildIndex( child );
					array["blendMode"] = child.blendMode;
					
					/////////////Get registration offset
					//Draw MC onto bitmap
					var bounds:Rectangle = child.getBounds(child);
					var bitmapData:BitmapData = new BitmapData(bounds.width, bounds.height, true, 0x00000000);
					var matrix:Matrix = new Matrix();
					matrix.translate( -bounds.x, -bounds.y);
					bitmapData.draw(child, matrix);
					
					//Go through each pixel and find the true center of the shape
					var X:Number = 0;
					var Y:Number = 0;
					var xArray:Array = [];
					var yArray:Array = [];
					var numOfPixels:Number = bitmapData.width * bitmapData.height; 
					
					for (var i2:int = 0; i2 < bitmapData.width; i2++) { 
     					 for (var j2:int = 0; j2 < bitmapData.height; j2++) {
       						var color2:uint = bitmapData.getPixel(i2, j2);
       							if (color2 > 0) {
       								 xArray.push(i2);
        							 yArray.push(j2);
       							 }
       
     					 }
    				 }
					
					//Get the average x and average y
					for (var i3:int = 0; i3 < xArray.length; i3++) {
						X += xArray[i3];
						}
					for (var i4:int = 0; i4 < yArray.length; i4++) {
						Y += yArray[i4];
						}
					
					X = X / xArray.length;
					Y = Y / yArray.length;
					
					
					//Final x and final y
					var finalX:Number = X + bounds.x + child.x; 
					var finalY:Number = Y + bounds.y + child.y;
					
					//The offset from registration point
					var offsetX:Number = child.x - finalX;
					var offsetY:Number = child.y - finalY;
					

    				array["offsetX"] = offsetX;
					array["offsetY"] = offsetY;
					
				
				data[f][child.name] = array;
			}
			}
			
			for (var ia:int = 0; ia < mc.numChildren; ia++) {
				var child = mc.getChildAt(ia);
				if (!ChildrenArray[child.name]) {
					ChildrenArray[child.name] = child.name;
					
					if (child.name.indexOf("instance") != -1) {
						trace("WARNING Symbol is not named on frame 1"); 
						}
				}
			}
			
			var xml:XML = <Animations></Animations>
			
			for (var frame:int = 1; frame <= mc.totalFrames; frame++) {
				
				var xml2:XML = <Animation></Animation>;
				var append:Boolean = false;
				mc.gotoAndStop(frame);
				var labelName = mc.currentLabel;
				if (labelName == null) { continue }

				if (label != labelName) {
					label = labelName
					var a = frame;
					
					for each(var ch in ChildrenArray) {
						a = frame
						var xml3:XML = <Part></Part>
						xml3.@name = ch;
						xml2.appendChild(xml3)

						while (true) {
							////
							var xml4:XML = <Frame></Frame>

							if (mc[ch] == null) {
								throw("Symbol " + ch + " not found on frame " + mc.currentFrame);
								}
							trace( a )
							trace(ch)
							
							trace(xml4.@x)
							trace(data[a][ch])
							
							xml4.@x = data[a][ch].x;
							xml4.@y = data[a][ch].y;
							
							
							xml4.@scaleX = data[a][ch].scaleX;//mc[ch].scaleX.toFixed(2);
							xml4.@scaleY = data[a][ch].scaleY;//mc[ch].scaleY.toFixed(2);
							
							xml4.@rotation = data[a][ch].rotation;
							xml4.@alpha = data[a][ch].alpha;
							
							
							xml4.@colorMatrix = data[a][ch].colorMatrix;
							xml4.@depth = data[a][ch].depth;
							xml4.@blendMode = data[a][ch].blendMode;
							
							xml4.@offsetX = data[a][ch].offsetX;
							xml4.@offsetY = data[a][ch].offsetY;
							
							xml3.appendChild(xml4);
							////
							a++
							mc.gotoAndStop(a);

							if (label != mc.currentLabel || a > mc.currentFrame) { break }
							
							}

						mc.gotoAndStop(frame);
					}
					xml2.@name = labelName;
					xml2.@frameCount = (a-frame);
				xml.appendChild(xml2);
					append = true;
					}
				
				
				}
				
		//Converts XML to JSON before exporting
		var JSON:String = Convert.Conversion(xml);
		var byteArray:ByteArray = new ByteArray();
		byteArray.writeMultiByte(JSON, "iso-8859-1")
		ExportFile(getQualifiedClassName(mc) + "Anim.json", byteArray)
		
		
	}
	private function ExportFile(FileName:String,data) {
			var filename:String = FileName;
			var byteArray:ByteArray = data

			var file:File = File.applicationDirectory.resolvePath( filename );
			var wr:File = new File( file.nativePath );
			var stream:FileStream = new FileStream();
			stream.open( wr , FileMode.WRITE);
			stream.writeBytes ( byteArray, 0, byteArray.length );
			stream.close();
			}
	
}
}