# Android TEE light client

This is a PoC showing a bitcoin light client running on TEEs found
on commercial Android devices.

It exposes a JSON RPC accepting the BTC block interval to validate
and returns the TEE backed proof that the blocks are chained correctly.

## Requirements

 - Android device with a TEE (Strongbox, Samsung Knox, ...)
 - Android SDK 33+
 - Android NDK 25.2
 - Rust v1.76.0
 - `armv7-linux-androideabi` rust toolchain

## Project setup

### `local.properties`

```
> cat local.properties
sdk.dir=/opt/android-sdk
ndk.dir=/opt/android-sdk/ndk/25.2.9519653
rust.rustcCommand=/<home>/.cargo/bin/rustc
rust.cargoCommand=/<home>/.cargo/bin/cargo
```

### Build & install the app

```bash
./connect-device.sh
./gradlew clean assembleDebug installDebug
```

## Run

### Run the JSONRPC/WS server

```bash
cd server
cp example-config.json config.json
```

Populate the config.json missing properties and then run the JSONRPC server:

```bash
pnpm i
node index.js
```

## Test

Request a proof through the JSON rpc call

```bash
curl -X POST -H 'content-type:application/json' -d '{"jsonrpc": "2.0", "method":"generateProof", "id":"1", "params": ["bitcoin", 841375,841376]}' http://localhost:3030/v1
```

This is the proof returned:

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "statement": "00000000000000000000d8424403789af1c7443b1f1e723279a7de3e8ea7659e00000000000000000000d8424403789af1c7443b1f1e723279a7de3e8ea7659e",
    "proof": {
      "type": "android",
      "value": {
        "commitment": "27f7bd87fee457eb8b3ccf1830c705312751199ce91175f216591d0c86eac0e4",
        "signature": "218d48b6a763af655687657feeff158f218049b9174b318afa5a5945137684c47ccf9aa3e207e8df1fef500e7967fae7cbae52b41ebff2a428a11135f529d4571b",
        "publicKey": "04bc67c4bb5b1daddfbe86cb86fdac8361e051f5b538e01add31e91f23589bb07038e57f4ce78a075af07fd815ad8581b3f987ad77a8782384d0cae88868d91e11",
        "attestedPublicKey": "3046022100be499f2e4719f9625079cd3033c4634b79ec835472b0c879bb55c065d4657a8402210084ec565fab1b39d5feeccb90ba5fb1bae7f847af816c6017a7a6f30f66d23962",
        "certificateChain": "bf646c6561669f1830387d0238771830387d02182f385f0302010202010118300a0608182a387918483831183d04030218301829183118191830170603185504051310183018661863186318661830186418351834183818391862186118301834186318310c18300a06031855040c0c0318541845184518301820170d183718301830183118301831183018301830183018301830185a18180f18321831183018361830183218301837183018361832183818311835185a1830181f1831181d1830181b0603185504030c141841186e18641872186f186918641820184b1865187918731874186f187218651820184b18651879183018591830130607182a387918483831183d02010608182a387918483831183d0301070318420004103861381f183e387f3838382d0b3825187038493845371850341832385f18320834186738223238453851083856382938661863183d18700d185f3841053826186e185b321858387b182b1875384e385b28381818270238703843073851186418363854185d18193873385f382e184a1856385c387d01184e1830387d01184a18300e06031855181d0f0101200404030207387f1830387d011836060a182b060104013829187902011104387d0118261830387d0118220201030a01010201040a01010416186d1875186c1874186918701872186f186f1866186c186118621873182e1861186e18641872186f186918640400183018533840387a183d080206013870183834184d387f3840387a184518430418411830183f183118191830170412186d1875186c1874186918701872186f186f1866186c186118621873182e1874186518650201011831182204182005386f301835381b385738611856181d187d184c25384e38672c18181819382f381c184b386a384818733824384a384c187238351870184f184f18771830387e385b385e08183106020102020103385d03020103385c0402020100385a051831030201043855030201013840387c18770205003840387a183e030201003840387a1840184c1830184a041820186122385e182b183232387b1821184a38632e183d181a2038483855387f38423875182638753879181e382b3844187a15170f181a384f0c0101200a01000418203860182938703835387a1845383f382c186118700818443834385d186b1867183b183236183a38582509384d184c3872353863184c182e382f18473840387a184105020301382b383f3840387a18420502030315187e3840387a184e0602040118341865183d3840387a184f0602040118341865183d18300a0608182a387918483831183d0403020318470018301844021820187c1852381d383a384618450c18330838290d385818681849186638712f29387f3850387918483834383c184b187d385f18743538191860185902182018540d38461855183d1720386b186a385a182c3868387a303877381a18723831387c183f38631867184e1868183b184a387f31186b1827387a386aff6c696e7465726d6564696174659f1830387d0218261830387d013854385f03020102020a111854187814161827003866011418300a0608182a387918483831183d04030218301829183118191830170603185504051310186218371865183818391865186418611835186318371865183718641830186218310c18300a06031855040c0c031854184518451830181e170d183118381830183918321830183218321832183618321838185a170d183218381830183918311837183218321832183618321838185a18301829183118191830170603185504051310183018661863186318661830186418351834183818391862186118301834186318310c18300a06031855040c0c03185418451845183018591830130607182a387918483831183d02010608182a387918483831183d030107031842000411182638501864387f382301384a181f182f3856184f0820185938263845183f182c386e387618300238251866383938271820383c3836383a186238453823387f385c02186238333878384f38720e382538433846186616185618710538671827384d181f1018783830387e33184f381d38593879385c387e38451830387e38481830181d06031855181d0e04160414186138401823113870381e382318701829382138403835186a3859385d186c2e38741875221830181f06031855181d1823041818183016387f143854183938751878181e186a38181843211866382a1833385f184d184018771847184c185f385718300f06031855181d13010120040518300301012018300e06031855181d0f0101200404030202041830185406031855181d181f04184d1830184b18301849385f1847385f18453879184318681874187418701873183a182f182f1861186e18641872186f18691864182e1867186f186f1867186c18651861187018691873182e1863186f186d182f186118741874186518731874186118741869186f186e182f18631872186c182f1831183118351834183718381831183418311836183218371830183018391839183018311831183418300a0608182a387918483831183d040302031869001830186602183100387b381d07185d381c386d187b18710d18683830387438203874185f16183018532d385428385117183a3828184c38771840185d1879387f1876186e3837184f1849186a383c1877183c3854381a187009386b28385e3834021831003877381e381c381f38593872342938452c184b28382f38252b182e3856185229181b18511858381c186f05182808383018581866185f187634187f387d187237381c384c183a242520385e0e185438631874ff64726f6f749f1830387d03382e1830387d013846385f03020102020a033877182618671860186538763869387a385718300d0609182a387918483879280d01010b05001830181b18311819183017060318550405131018661839183218301830183918651838183518331862183618621830183418351830181e170d183118381830183918321830183218321832183418341835185a170d183218381830183918311837183218321832183418341835185a18301829183118191830170603185504051310186218371865183818391865186418611835186318371865183718641830186218310c18300a06031855040c0c03185418451845183018761830100607182a387918483831183d02010605182b387e040018220318620004186e1858385702387b32187c1868186c183f186c3837383918393853385f385c18620b0b1852385d386b381c385011384c186d386e381f183a384e38382a323855187638263829386e383d183b1835013856181a22385d1838185a184818631867131858187f38293823073856385a38411819183e385a3865383018181873184f3867313870186f38321863186a3842383731185403184b0538613842183e181b386a387e384438280f3840187e1845385c387e38491830387e384c1830181d06031855181d0e041604143854183938751878181e186a38181843211866382a1833385f184d184018771847184c185f38571830181f06031855181d1823041818183016387f1418361861381e00187c38770509185138741844186c184720181a184c383635184f1218300f06031855181d13010120040518300301012018300e06031855181d0f0101200404030202041830185006031855181d181f0418491830184718301845385f1843385f18413879183f18681874187418701873183a182f182f1861186e18641872186f18691864182e1867186f186f1867186c18651861187018691873182e1863186f186d182f186118741874186518731874186118741869186f186e182f18631872186c182f184518381846184118311839183618331831183418441832184618411831183818300d0609182a387918483879280d01010b050003387d0201001822181a387018603833386b182d186427185a2e38460d1875184c34184229386028185c384d186338563847187c385f3840385d381b184f1867184238333826187a181c187c38381832184e186e3874385638233841382b38621820387d383f201831151825383418503859384122381b38310d185818701861387438591856184c3877385a385b181d38453849385c1873183d182c3879184d1831185e383f38461874387402382f18591843186e381c18661836213861131829386238213865181c1825181a3878387f184e0a103841183b186131186a26383b18333865183411184c382e3438293855382f186618771837185d187f3845186c01386538423846382d186f384c1870185e38311823387338290c3845185518693841143836383f32184b387924381938461839382c381d387a1322185c384938591818181a185b1127023838381838373877187918201843381e384805185238513854182a2518620a386314185d3870382138673864185c385e3867343867185507242e3849182f18213877382118361839381f381a387c1837083866182d330d3840186d1858187738421839383b387008182a3821187318743828301869387d37340618590c387a386a383515381e2e385d38463822387434386b184938582e181818292718393866382b181e387a184618631855187f386e387a3866153873387e183b384f384a1875181d186718743826182e3844187f186c38642e383116260e387318390c385a3825382417383b143862387e1438210d182e1875382f09385a383e383338471823382238211822381e384d3859185518380b183f186a1836187e18733866387b1824186d183b183d387b186f18671844383a0d1836185a1848182c38583822132f18341852185d1852182a22185b33186918580c184d18481845387f3861185c25183f3820186d185f186818470e183403182738673857381e182d3862183a38543867382e38273855387638481863183d387818573838185938313864183b18323818384d181918570e385216186b1843187f387d143852153825382238701834181b18453836387f381a381c09387c18361861182d013856385b382429187c12185b381e381e382e184b18301832181f185938310038223860386c1852185238433850187b0d184f1864184a187c38581836186202251857383d18231867385b1138443833383509382f32183b386f18291870186a1822185e18771854384101184418543840186d3843187e38463718462a186c38190f1862386918682bffff"
      }
    }
  }
}
```

Where:

 - `statement` is the concatenation of the first and last block hash of the interval
 - `proof`: 
   - `type`: the platform which generated the proof
   - `value`: the android proof verifiable data consisting in
     - `commitment`: the actual message secp256k1 signed
     - `signature`: the secp256k1 signature on the commitment
     - `publicKey`: the public key of the key signing the commitment
     - `attestedPublicKey`: the signature of the sha256 hash of the secp256k1 public key made
   with the Android attestation key
     - `certficateChain`: the android attestation certificate chain attesting the generation of 
   the attestation key
