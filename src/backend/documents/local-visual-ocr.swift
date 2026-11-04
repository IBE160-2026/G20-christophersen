import Foundation
import PDFKit
import Vision
import AppKit
import CryptoKit

// Lokal avledet evidens. PDF.js-tekst og originale offseter endres aldri.
let args = CommandLine.arguments
let originalParent = getppid()
let parentWatch = DispatchSource.makeTimerSource(queue:DispatchQueue.global(qos:.utility))
parentWatch.schedule(deadline:.now()+0.25,repeating:0.25)
parentWatch.setEventHandler {
    if getppid() != originalParent { exit(3) }
    var usage = rusage()
    if getrusage(RUSAGE_SELF, &usage) == 0 && usage.ru_maxrss > 512*1024*1024 { exit(4) }
}
parentWatch.resume()
guard args.count == 2, let document = PDFDocument(data: FileHandle.standardInput.readDataToEndOfFile()) else { exit(2) }
let requested = args[1].split(separator: ",").compactMap { Int($0) }
struct Region { var x: Int; var y: Int; var w: Int; var h: Int; var hasIcon = true }
func box(_ r: CGRect) -> [String: Double] {
    return ["x": Double(r.minX), "y": Double(1-r.maxY), "width": Double(r.width), "height": Double(r.height)]
}
func recognize(_ image: CGImage, tokenSink: (([String:Any]) -> Void)? = nil) throws -> [[String: Any]] {
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.usesLanguageCorrection = false
    request.recognitionLanguages = ["nb-NO", "en-US"]
    request.usesCPUOnly = true
    request.minimumTextHeight = 0.001
    try VNImageRequestHandler(cgImage: image, options: [:]).perform([request])
    return (request.results ?? []).flatMap { observation -> [[String: Any]] in
        guard let text = observation.topCandidates(1).first else { return [] }
        let confidence = Double(text.confidence)
        var tokenRanges: [Range<String.Index>] = []
        if let regex = try? NSRegularExpression(pattern:"[TТΤ]G\\s*(?:[0-3]|IU)(?![A-Za-z0-9])", options:[.caseInsensitive]) {
            for match in regex.matches(in:text.string,range:NSRange(text.string.startIndex...,in:text.string)) {
                guard let range = Range(match.range,in:text.string) else { continue }
                tokenRanges.append(range)
                if let sink = tokenSink, let tokenBox = try? text.boundingBox(for:range) {
                    let prefix = String(text.string[..<range.lowerBound]).trimmingCharacters(in:.whitespaces)
                    let suffix = String(text.string[range.upperBound...]).trimmingCharacters(in:CharacterSet.whitespaces.union(CharacterSet(charactersIn:")")))
                    let boundedPrefix = prefix.range(of:"^[!0OJI•(). -]*$",options:.regularExpression) != nil
                    let possibleName = suffix.count <= 150 && suffix.first?.isUppercase == true && suffix.range(of:"[.!?:;]$",options:.regularExpression) == nil
                    sink(["text":String(text.string[range]),"confidence":confidence,"box":box(tokenBox.boundingBox),"headingCandidate":boundedPrefix && (suffix.isEmpty || possibleName)])
                }
            }
        }
        // Vision kan gi ett tekstobjekt for både TG-skilt og navnet til høyre.
        // Del bare en entydig innledende grad med faktisk tegngeometri. Alle
        // øvrige observasjoner bevares ordrett, også usikker avviksprosa.
        if tokenSink != nil, tokenRanges.count == 1, let range = tokenRanges.first {
            let prefix = String(text.string[..<range.lowerBound]).trimmingCharacters(in:.whitespaces)
            var start = range.upperBound
            while start < text.string.endIndex && (text.string[start].isWhitespace || text.string[start] == ")") { start = text.string.index(after:start) }
            let suffix = String(text.string[start...])
            if prefix.range(of:"^[!0OJI•(). -]*$",options:.regularExpression) != nil,
               !suffix.isEmpty, suffix.count <= 150, suffix.first?.isUppercase == true,
               suffix.range(of:"[.!?:;]$",options:.regularExpression) == nil,
               let tokenBox = try? text.boundingBox(for:range),
               let nameBox = try? text.boundingBox(for:start..<text.string.endIndex),
               nameBox.boundingBox.minX > tokenBox.boundingBox.maxX {
                return [["text":String(text.string[range]),"confidence":confidence,"box":box(tokenBox.boundingBox)],
                        ["text":suffix,"confidence":confidence,"box":box(nameBox.boundingBox)]]
            }
        }
        return [["text": text.string, "confidence": confidence, "box": box(observation.boundingBox)]]
    }
}
func badgeRegions(_ context: CGContext, _ width: Int, _ height: Int) -> [Region] {
    guard let data = context.data else { return [] }
    let pixels = data.bindMemory(to: UInt8.self, capacity: width*height*4)
    var mask = [UInt8](repeating: 0, count: width*height)
    for index in 0..<width*height {
        let r = Int(pixels[index*4]), g = Int(pixels[index*4+1]), b = Int(pixels[index*4+2])
        // Dette er kun kandidatsegmentering. Graden kommer fra skiltets OCR.
        let warm = r > 145 && r > g+25 && g > 20 && b < 145
        let green = g > 100 && g > r+8 && g > b+25
        if warm || green { mask[index] = 1 }
    }
    var regions: [Region] = []
    for seed in 0..<mask.count where mask[seed] == 1 {
        var stack = [seed]; mask[seed] = 0
        var minX = seed%width, maxX = minX, minY = seed/width, maxY = minY, count = 0
        while let index = stack.popLast() {
            let x = index%width, y = index/width
            minX = min(minX,x); maxX = max(maxX,x); minY = min(minY,y); maxY = max(maxY,y); count += 1
            for next in [x > 0 ? index-1 : -1, x+1 < width ? index+1 : -1, y > 0 ? index-width : -1, y+1 < height ? index+width : -1] {
                if next >= 0 && mask[next] == 1 { mask[next] = 0; stack.append(next) }
            }
        }
        let w = maxX-minX+1, h = maxY-minY+1
        let ratio = Double(w)/Double(h)
        if Double(w)/Double(width) >= 0.025 && Double(w)/Double(width) <= 0.11 && Double(h)/Double(height) >= 0.005 && Double(h)/Double(height) <= 0.025 && ratio >= 1.8 && ratio <= 6.5 && Double(count)/Double(w*h) >= 0.4 {
            regions.append(Region(x:minX,y:minY,w:w,h:h))
        }
    }
    return regions
}
// En avgrenset neste-spalte-pass kan finne etiketter som helsiden utelot.
// Ulike avlesninger erstatter aldri hverandre som sikkert tekstbevis.
func recoverColumnContinuation(_ image: CGImage, _ lines: inout [[String:Any]], _ symbols: [[String:Any]]) throws {
    func normalized(_ value: String) -> String { value.uppercased().filter{!$0.isWhitespace} }
    func grade(_ value: String) -> String? {
        let text=normalized(value).replacingOccurrences(of:"Т",with:"T").replacingOccurrences(of:"Τ",with:"T")
        guard text.range(of:"^[!0OJI•().-]*TG[23][!•().-]*$",options:.regularExpression) != nil else { return nil }
        return text.contains("TG3") ? "TG3" : "TG2"
    }
    func ending(_ text: String) -> Bool { text.range(of:"^(Konsekvens\\s*/?\\s*tiltak|Tiltak|Kostnadsestimat|Anbefalte tiltak)\\s*:?[ \\t]*$",options:[.regularExpression,.caseInsensitive]) != nil }
    let headers=lines.compactMap { line -> Double? in
        guard let text=line["text"] as? String,text.range(of:"^Tilstandsrapport$",options:[.regularExpression,.caseInsensitive]) != nil,
              let box=line["box"] as? [String:Double],let y=box["y"],let h=box["height"] else { return nil }
        return y+h+0.01
    }
    // Uten gjenkjennelig innholdsområde beholdes siden for videre tolkning.
    guard let top=headers.max(),top >= 0.05,top < 0.4 else { return }
    for symbol in symbols {
        guard let box=symbol["box"] as? [String:Double],let sx=box["x"],let sy=box["y"],sx < 0.45,sy > 0.7,
              let readings=symbol["readings"] as? [[String:Any]],readings.count == 2,
              let first=readings[0]["text"] as? String,let second=readings[1]["text"] as? String,
              let firstGrade=grade(first),grade(second) == firstGrade,
              readings.allSatisfy({($0["confidence"] as? Double ?? 0) >= 0.3}) else { continue }
        let bottomLabels=lines.filter { line in
            guard let text=line["text"] as? String,let b=line["box"] as? [String:Double],let x=b["x"],let y=b["y"] else { return false }
            return text.range(of:"^Vurdering av avvik\\s*:?[ \\t]*$",options:[.regularExpression,.caseInsensitive]) != nil && x >= sx-0.025 && x < sx+0.16 && y > max(sy,0.8) && y < 0.94
        }
        guard bottomLabels.count == 1,let labelBox=bottomLabels[0]["box"] as? [String:Double],let labelY=labelBox["y"] else { continue }
        let hasEnding=lines.contains { line in
            guard let text=line["text"] as? String,let b=line["box"] as? [String:Double],let x=b["x"],let y=b["y"] else { return false }
            return ending(text) && x >= sx-0.025 && x < sx+0.16 && y > labelY && y < 0.94
        }
        if hasEnding { continue }
        let rightHeaders=symbols.compactMap { other -> [String:Double]? in
            guard let b=other["box"] as? [String:Double],let x=b["x"],let y=b["y"],x > sx+0.25,x < 0.8,y > top else { return nil };return b
        }
        guard let rightX=rightHeaders.compactMap({$0["x"]}).min(),let end=rightHeaders.filter({abs(($0["x"] ?? 0)-rightX)<0.08}).compactMap({$0["y"]}).min(),end-top > 0.02,end-top < 0.4 else { continue }
        let left=max(0,Int(floor((rightX-0.02)*Double(image.width)))),pixelTop=max(0,Int(floor(top*Double(image.height))))
        let w=image.width-left-Int(Double(image.width)*0.02),h=Int(floor((end-top)*Double(image.height)))
        guard w>0,h>0,let crop=image.cropping(to:CGRect(x:left,y:pixelTop,width:w,height:h)),
              let enlarged=CGContext(data:nil,width:crop.width*2,height:crop.height*2,bitsPerComponent:8,bytesPerRow:crop.width*8,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue) else { continue }
        enlarged.interpolationQuality = .high;enlarged.draw(crop,in:CGRect(x:0,y:0,width:crop.width*2,height:crop.height*2))
        guard let cropImage=enlarged.makeImage() else { continue }
        for var candidate in try recognize(cropImage) {
            guard let b=candidate["box"] as? [String:Double],let x=b["x"],let y=b["y"],let width=b["width"],let height=b["height"],let text=candidate["text"] as? String,let confidence=candidate["confidence"] as? Double else { continue }
            let mapped=["x":(Double(left)+x*Double(w))/Double(image.width),"y":(Double(pixelTop)+y*Double(h))/Double(image.height),"width":width*Double(w)/Double(image.width),"height":height*Double(h)/Double(image.height)]
            candidate["box"]=mapped
            let overlaps=lines.indices.filter { index in
                guard let old=lines[index]["box"] as? [String:Double],let ox=old["x"],let oy=old["y"],let ow=old["width"],let oh=old["height"] else { return false }
                let overlapX=max(0,min(ox+ow,mapped["x"]!+mapped["width"]!)-max(ox,mapped["x"]!))
                return overlapX/min(ow,mapped["width"]!) > 0.5 && abs(oy+oh/2-mapped["y"]!-mapped["height"]!/2)<max(0.006,max(oh,mapped["height"]!)*0.65)
            }
            if overlaps.isEmpty { lines.append(candidate);continue }
            if overlaps.count == 1,let index=overlaps.first,let oldText=lines[index]["text"] as? String,normalized(oldText) == normalized(text) {
                lines[index]["cropReading"]=["text":text,"confidence":confidence]
            } else {
                for index in overlaps { lines[index]["conflictingReading"]=["text":text,"confidence":confidence];lines[index].removeValue(forKey:"cropReading") }
            }
        }
        break // høyst ett lite fortsettelsesområde per side
    }
}
for number in requested.prefix(40) {
    autoreleasepool {
        var result: [String: Any] = ["pdfPage":number,"lines":[],"symbols":[],"width":1,"height":1,"rasterDigest":NSNull(),"error":NSNull()]
        do {
            guard number >= 1, number <= document.pageCount, let page = document.page(at:number-1) else { throw NSError(domain:"page",code:1) }
            let bounds = page.bounds(for:.cropBox)
            let scale = min(4, 3200/max(bounds.width,bounds.height))
            let width = Int(ceil(bounds.width*scale)), height = Int(ceil(bounds.height*scale))
            guard width > 0, height > 0, let context = CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue) else { throw NSError(domain:"render",code:1) }
            context.setFillColor(NSColor.white.cgColor); context.fill(CGRect(x:0,y:0,width:width,height:height))
            context.scaleBy(x:scale,y:scale); context.translateBy(x:-bounds.origin.x,y:-bounds.origin.y)
            page.draw(with:.cropBox,to:context)
            guard let image = context.makeImage() else { throw NSError(domain:"render",code:2) }
            if let pixelData = image.dataProvider?.data { result["rasterDigest"] = SHA256.hash(data: pixelData as Data).map { String(format:"%02x",$0) }.joined() }
            result["width"] = width; result["height"] = height
            var pageGradeTokens: [[String:Any]] = []
            var pageLines = try recognize(image, tokenSink:{ pageGradeTokens.append($0) })
            // Raster uten PDF-tekst kan bare støtte lavere sikkerhetsverdier
            // når et separat utsnitt gir nøyaktig samme avledede tekst.
            let gradeRows = pageGradeTokens.filter { row in
                guard row["headingCandidate"] as? Bool == true,let value=row["text"] as? String else { return false }
                return value.range(of:"^[TТΤ]G\\s*[23]$",options:[.regularExpression,.caseInsensitive]) != nil
            }
            let firstGradeY = gradeRows.compactMap{($0["box"] as? [String:Double])?["y"]}.min() ?? 1.0
            // Ren lokal arbeidsprioritering: når den avledede linjen allerede
            // finnes i PDFKit-teksten, overlates korroborasjonen til backendens
            // opprinnelige PDF.js-kildekontroll. PDFKit-tekst er aldri bevisfelt.
            let nativeText = (page.string ?? "").uppercased().filter{!$0.isWhitespace}
            var cropCount = 0
            for index in pageLines.indices {
                guard let confidence = pageLines[index]["confidence"] as? Double, confidence >= 0.5, confidence < 0.7,
                      cropCount < 64, !gradeRows.isEmpty, let b=pageLines[index]["box"] as? [String:Double],let x=b["x"],let y=b["y"],let w=b["width"],let h=b["height"],y >= firstGradeY-0.08,y < 0.94 else { continue }
                if let lineText=pageLines[index]["text"] as? String {
                    let normalized=lineText.uppercased().filter{!$0.isWhitespace}
                    if !normalized.isEmpty && nativeText.contains(normalized) { continue }
                }
                cropCount += 1
                let left=max(0,Int(floor(x*Double(width)))-3),top=max(0,Int(floor(y*Double(height)))-3)
                let cropWidth=min(width-left,Int(ceil(w*Double(width)))+6),cropHeight=min(height-top,Int(ceil(h*Double(height)))+6)
                guard cropWidth > 0,cropHeight > 0,let crop=image.cropping(to:CGRect(x:left,y:top,width:cropWidth,height:cropHeight)),
                      let resized=CGContext(data:nil,width:crop.width*2,height:crop.height*2,bitsPerComponent:8,bytesPerRow:crop.width*8,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue) else { continue }
                resized.interpolationQuality = .high
                resized.draw(crop,in:CGRect(x:0,y:0,width:crop.width*2,height:crop.height*2))
                guard let lineImage=resized.makeImage() else { continue }
                let cropLines=try recognize(lineImage)
                let cropText=cropLines.compactMap{$0["text"] as? String}.joined(separator:" ")
                if !cropText.isEmpty && cropText.count <= 4000 { pageLines[index]["cropReading"] = ["text":cropText,"confidence":cropLines.compactMap{$0["confidence"] as? Double}.min() ?? 0] }
            }
            result["lines"] = pageLines
            var symbols: [[String:Any]] = []
            var regions = badgeRegions(context,width,height)
            // Gråtone, svart/hvitt og uvanlige farger krever ingen fargemal.
            // Bare et eksplisitt fullside-TG-token i overskriftsgeometri kan gi
            // denne kandidaten; utsnittet må fortsatt lese samme grad separat.
            for token in pageGradeTokens where token["headingCandidate"] as? Bool == true {
                guard let b = token["box"] as? [String:Double], let x=b["x"],let y=b["y"],let w=b["width"],let h=b["height"],
                      w >= 0.012, w <= 0.11, h >= 0.004, h <= 0.03 else { continue }
                let centerX = (x+w/2)*Double(width), centerY = (y+h/2)*Double(height)
                if regions.contains(where:{centerX >= Double($0.x)-2 && centerX <= Double($0.x+$0.w)+2 && centerY >= Double($0.y)-2 && centerY <= Double($0.y+$0.h)+2}) { continue }
                let left=max(0,Int(floor(x*Double(width)))-2),top=max(0,Int(floor(y*Double(height)))-2)
                regions.append(Region(x:left,y:top,w:min(width-left,Int(ceil(w*Double(width)))+4),h:min(height-top,Int(ceil(h*Double(height)))+4),hasIcon:false))
            }
            for region in regions.prefix(80) {
                // Piktogrammet til venstre er ikke gradtekst og kan ligne 0/!.
                let textStart = region.x + (region.hasIcon ? Int(Double(region.w)*0.28) : 0)
                let rect = CGRect(x:textStart,y:max(0,region.y-2),width:min(width-textStart,region.w-(textStart-region.x)+2),height:min(height-region.y,region.h+4))
                guard let crop = image.cropping(to:rect), let enlarged = CGContext(data:nil,width:crop.width*4,height:crop.height*4,bitsPerComponent:8,bytesPerRow:crop.width*16,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue) else { continue }
                enlarged.interpolationQuality = .high
                enlarged.draw(crop,in:CGRect(x:0,y:0,width:crop.width*4,height:crop.height*4))
                guard let badgeImage = enlarged.makeImage() else { continue }
                let readings = try recognize(badgeImage)
                let text = readings.compactMap { $0["text"] as? String }.joined(separator:" ")
                let confidence = readings.compactMap { $0["confidence"] as? Double }.min() ?? 0
                let badgeBox = ["x":Double(region.x)/Double(width),"y":Double(region.y)/Double(height),"width":Double(region.w)/Double(width),"height":Double(region.h)/Double(height)]
                let wholeReadings = pageGradeTokens.filter { row in
                    guard let b = row["box"] as? [String:Double],let x=b["x"],let y=b["y"],let w=b["width"],let h=b["height"] else { return false }
                    return x >= badgeBox["x"]!-0.002 && x+w <= badgeBox["x"]!+badgeBox["width"]!+0.002 && y >= badgeBox["y"]!-0.002 && y+h <= badgeBox["y"]!+badgeBox["height"]!+0.002
                }
                let pageText = wholeReadings.compactMap { $0["text"] as? String }.joined(separator:" ")
                let pageConfidence = wholeReadings.compactMap { $0["confidence"] as? Double }.min() ?? 0
                symbols.append(["grade":NSNull(),"text":text,"confidence":confidence,"box":badgeBox,"readings":[["text":pageText,"confidence":pageConfidence],["text":text,"confidence":confidence]]])
            }
            try recoverColumnContinuation(image,&pageLines,symbols)
            result["lines"] = pageLines
            result["symbols"] = symbols
        } catch { result["error"] = "Lokal bilde-/OCR-lesing feilet på siden (\((error as NSError).domain):\((error as NSError).code))." }
        if let data = try? JSONSerialization.data(withJSONObject:result,options:[.sortedKeys]) { FileHandle.standardOutput.write(data); FileHandle.standardOutput.write(Data([10])) }
    }
}
