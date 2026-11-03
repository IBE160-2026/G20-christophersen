import Foundation
import PDFKit
import AppKit

// Testverktøy: gjør utelukkende fiktive PDF-byter til en ekte raster-PDF.
// Ingen tekstobjekter kopieres til resultatet.
let input = FileHandle.standardInput.readDataToEndOfFile()
guard let pdf = PDFDocument(data:input), let page = pdf.page(at:0) else { exit(2) }
let monochrome = CommandLine.arguments.contains("--monochrome")
let bounds = page.bounds(for:.cropBox), scale = 2.0
let width=Int(ceil(bounds.width*scale)),height=Int(ceil(bounds.height*scale))
let space = monochrome ? CGColorSpaceCreateDeviceGray() : CGColorSpaceCreateDeviceRGB()
let bitmapInfo = monochrome ? CGImageAlphaInfo.none.rawValue : CGImageAlphaInfo.premultipliedLast.rawValue
guard let bitmap = CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:0,space:space,bitmapInfo:bitmapInfo) else { exit(3) }
bitmap.setFillColor(NSColor.white.cgColor); bitmap.fill(CGRect(x:0,y:0,width:width,height:height))
bitmap.scaleBy(x:scale,y:scale); bitmap.translateBy(x:-bounds.minX,y:-bounds.minY)
page.draw(with:.cropBox,to:bitmap)
guard let image=bitmap.makeImage() else { exit(4) }
let output=NSMutableData()
var media=CGRect(x:0,y:0,width:bounds.width,height:bounds.height)
guard let consumer=CGDataConsumer(data:output as CFMutableData),let context=CGContext(consumer:consumer,mediaBox:&media,nil) else { exit(5) }
context.beginPDFPage(nil)
context.draw(image,in:media)
context.endPDFPage(); context.closePDF()
FileHandle.standardOutput.write(output as Data)
