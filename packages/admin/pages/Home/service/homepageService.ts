import { IHomepageCreativeItem, IHomepageTechnologyItem, IShowCaseItem } from '../types/homepage';
const HOMEPAGE_CREATIVE: IHomepageCreativeItem[] = [
  {
    title: '一站式服务',
    description: '高效进行创意制作、管理、触达及分析',
    keyFrameUrl:
      'https://p3-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/98ed5b4c25b54b5a9fa2c9d3c0342651.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1966493163&x-signature=SjyRCVzk%2BZF4f6oHX%2F64uiZMFgY%3D',
    keyFrameSelectUrl:
      'https://p3-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/98ed5b4c25b54b5a9fa2c9d3c0342651.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1966493163&x-signature=SjyRCVzk%2BZF4f6oHX%2F64uiZMFgY%3D',
    routePath: '/creative/playable',
    solutionPath: '/solution?solutionId=playable',
    showcase: [
      {
        title: '摇动彩蛋互动广告样式',
        description:
          '业内首创开机第一位摇动彩蛋，增强广告趣味性，有效激发用户参与互动，提升品牌力；双重路径实现高点击、强引流，提升落地页到达量。目前已下单客户有：彩虹糖、欧莱雅、康师傅冰红茶等',
        caseUrl:
          'https://v3-default.ixigua.com/f0d9d3b5a1d5eee454a381e98017e201/74206bb6/video/tos/cn/tos-cn-v-736065/59c24b50ab1d4600b9ee576778ef1d5a/?a=0&br=4698&bt=4698&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=&er=0&ft=uSx5SggtInz7TomDkYi&l=202109292122520102100982182124CCCC&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=anV3OGk6Zjg5ODQzNDg1M0ApcjxveHg6ZWtkZjMzajw1eWdsNmlycjRfZV5gLS1kNi9zc2RvcTJjNGAyMzIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [
          { number: '6', unit: '%+', name: 'CTR最高达' },
          { number: '5', unit: '%+', name: '互动比例高达' },
        ],
      },
      {
        title: 'AR互动广告样式',
        description:
          '在广告上为AR技术寻找应用场景，让用户在真实场景当中进行游戏体验，电商购物等，增强广告的沉浸式互动体验，给用户带来身临其境的感受，进一步提升广告转化',
        caseUrl:
          'https://v6-default.ixigua.com/13294df66cddb74e6ece25ba538258fa/74203041/video/tos/cn/tos-cn-v-736065/deb27d21b42048c98eb2874e8320d1c3/?a=0&br=1085&bt=1085&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TMbWkYi&l=202109291708530102112070910404FAB5&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M25qa2U6Znk1ODQzNDg1M0ApNjN3cXg6ZXNkZjMzajw1eWcwLXFrcjRfbV5gLS1kNi9zcy1oZGVfNGBzLzIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [
          { number: '600', unit: 'w+', name: '最高广告总曝光' },
          { number: '33', unit: '%+', name: '最高转化率' },
        ],
      },
      {
        title: '一镜到底互动广告样式',
        description:
          '通过彩蛋联动将“品牌广告”和“达人内容”进行串联，同时满足客户品牌宣传、内容种草及转化等需求，提升广告互动性、趣味性设计demo',
        caseUrl:
          'https://v3-default.ixigua.com/16b82db5c4cbe3b0b20ecaf221494870/74204a45/video/tos/cn/tos-cn-v-736065/b4ad3257ac7943bda69b944784194d30/?a=0&br=9198&bt=9198&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TnqVkYi&l=202109291859560102100511620A0AFD3E&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M3hwNDM6ZnA3ODQzNDg1M0ApbGxtOHg6NmVkZjMzajw1eWdmZmcycjQwX15gLS1kNi9zcy1yai4tNGBqMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [],
      },
      {
        title: '神灯互动广告样式',
        description:
          '通过长按、滑动等手势交互，唤起沉浸式彩蛋，有效提升用户参与度，提升品牌印象价值，目前已下单客户：vivo、宝马、网易梦幻西游等',
        caseUrl:
          'https://v6-default.ixigua.com/11b4d47b75725b53b193f197f0bd282d/74204956/video/tos/cn/tos-cn-v-736065/92d0dc9eb2cc4bcc858709455606e2f4/?a=0&br=6954&bt=6954&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7T5XVkYi&l=202109291856070102100511620A0AC3CB&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=Mzxwczs6Zmw3ODQzNDg1M0ApcHlncng6NmVkZjMzajw1eWdqc2FscjQwX15gLS1kNi9zcy02am01NGBmMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [],
      },
      {
        title: '裸眼3D互动广告样式',
        description:
          '将裸眼3D玩法融入到广告样式中，增加广告主品牌露出的权益，提升品牌印象价值；提供多次互动引导，提升转化率。目前已下单客户：vivo、MAC、雅诗兰黛等',
        caseUrl:
          'https://v3-default.ixigua.com/20dadfa6381b9bd9abf436a72bbff53a/742049ac/video/tos/cn/tos-cn-v-736065/ae43046d2dae426c8717359f288f98c0/?a=0&br=5339&bt=5339&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TFxVkYi&l=202109291857250102100511620A0AD946&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=ajo5MzM6ZnA3ODQzNDg1M0ApOTx2NHg6NmVkZjMzajw1eWczNnAucjQwX15gLS1kNi9zc2Q0My0tNGBqMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [],
      },
      {
        title: '捏捏软糖脸互动拍摄道具',
        description:
          '在抖音商业化拍摄器内录制道具视频，用户通过触碰屏幕边缘的手，来捏出脸上的彩虹糖，面部产生变形效果，结果得分生成并计算排名，实现裂变营销。目前已下单客户：箭牌彩虹糖',
        caseUrl:
          'https://v6-default.ixigua.com/39120f2bcfed274e7f45559eb878fce5/742049f3/video/tos/cn/tos-cn-v-736065/68de908c2365441084f980773239a349/?a=0&br=9751&bt=9751&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TZDVkYi&l=202109291858420102100511620A0AE83C&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=MzU7eGY6Zmw3ODQzNDg1M0ApbjdyO3g6NmVkZjMzajw1eWdoMWw1cjQwX15gLS1kNi9zcy0vNXJgNGBmMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动道具创意'],
        data: [],
      },
      {
        title: '接面具互动拍摄道具',
        description:
          '在抖音商业化拍摄器内录制道具游戏的视频，用户通过移动脸部来接掉落的气泡面具，挑战结束后自动跳转至发布器鼓励用户发布游戏视频，实现裂变营销。目前已下单客户：纯水乐气泡水',
        caseUrl:
          'https://v3-default.ixigua.com/c38a846bfb0370ebe83417d4e395d1e2/74204a81/video/tos/cn/tos-cn-v-736065/c57512f1a57f45c99ec22494a08a6a97/?a=0&br=9743&bt=9743&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TA7VkYi&l=202109291900580102100511620A0B141E&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=ajs1bWY6ZnA3ODQzNDg1M0ApZTNrO3g6NmVkZjMzajw1eWdfLWU1cjQwX15gLS1kNi9zc2Q1L2dgNGBqMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动道具创意'],
        data: [],
      },
      {
        title: '画一画互动直播玩法',
        description:
          '用抽奖和游戏的双重利益吸引用户，让用户通过描绘广告主体物轮廓的互动游戏，广告完成品牌透传的同时实现了广告转化。目前已下单客户：奥迪、央视财经-汽车、哈佛SUV等',
        caseUrl:
          'https://v6-default.ixigua.com/30a83d7cd193274a144ab604e6824cb2/74203259/video/tos/cn/tos-cn-v-736065/017f5437909749989807a1304311427c/?a=0&br=1561&bt=1561&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TQiWkYi&l=20210929171750010212204020274EFA39&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M3FoM2Y6Zmk0ODQzNDg1M0ApZXV2aXg6bWtkZjMzajw1eWdfb3BjcjRnZV5gLS1kNi9zcy1rYi1gNGBjLjIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动直播创意'],
        data: [],
      },
      {
        title: '摇钱树互动直播玩法',
        description: '通过摇动摇钱树的互动玩法参与活动，完成品牌透传，提升用户的参与度并拉长用户观看时长',
        caseUrl:
          'https://v3-default.ixigua.com/32f2575fe8fbd87bade7eb7f308cdfd4/742054c5/video/tos/cn/tos-cn-v-736065/9b388f399b4542d6b714b5b02b7921c8/?a=0&br=1158&bt=1158&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TbP9kYi&l=20210929194414010211181134105AD2DA&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M2tybjo6Znk4ODQzNDg1M0ApdHlwdHg6NjVkZjMzajw1eWduc2pucjQwL15gLS1kNi9zcy1lbGg0NGBzMjIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动直播创意'],
        data: [],
      },
    ],
  },
  {
    title: '可视化制作',
    description: '所见即所得的可视化编辑，低制作门槛，高制作效率',
    keyFrameUrl:
      'https://p3-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/25acaa8bee694d88838276378541aa64.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1966496697&x-signature=mASTgNsFJTxNjYGsG%2Bv%2FQpKWZ2U%3D',
    keyFrameSelectUrl:
      'https://p3-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/25acaa8bee694d88838276378541aa64.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1966496697&x-signature=mASTgNsFJTxNjYGsG%2Bv%2FQpKWZ2U%3D',
    routePath: '/creative/game',
    solutionPath: '/solution?solutionId=game',
    showcase: [
      {
        title: '龙舟跳一跳游戏',
        description:
          '用户在抖音极速版里通过控制粽子的跳跃方向，跳上龙舟完成各类任务获得金币，金币可以兑换成现金，任务中用户需要不断观看激励视频实现复活，业务也在这个过程中实现激励广告流量变现',
        caseUrl:
          'https://v6-default.ixigua.com/d528fde11a6a61921dcda49d2978d523/7420339b/video/tos/cn/tos-cn-v-736065/4688ccc3c556401caf1f9724761d287c/?a=0&br=975&bt=975&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7T.lKkYi&l=20210929172307010212204020274F547B&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=ajU3ZmU6Zmk0ODQzNDg1M0ApaHI5cHg6bWtkZjMzajw1eWdibDNqcjRnZV5gLS1kNi9zc2QvMWBfNGBjLjIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['金币游戏'],
        data: [
          { number: '66', unit: '%+', name: '次日留存' },
          { number: '1.76', unit: '', name: '最高ROI' },
        ],
      },
      {
        title: '集星光养成游戏',
        description:
          '用户在抖音企业号游戏里通过做任务获得星光去点亮星星，收集满五颗星星可以兑换自己想要的商品。游戏任务既能满足品牌广告主的深度经营诉求，同时可以增加用户与品牌的深度互动。目前已经下单客户有：美赞成',
        caseUrl:
          'https://v6-default.ixigua.com/a5d7a4439a7ada71d3cc8b45d596a360/74203265/video/tos/cn/tos-cn-v-736065/b217e8f4310e40eb8c56c99424a82fac/?a=0&br=659&bt=659&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TDiWkYi&l=20210929171659010212204020274EE9E9&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M3E2Zzc6Zmk0ODQzNDg1M0Apamg3bng6bWtkZjMzajw1eWdkYjFocjRnZV5gLS1kNi9zcy1rMGExNGBjLjIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['深度经营游戏'],
        data: [{ number: '113', unit: '元', name: '最低获客成本' }],
      },
      {
        title: '汽车竞速游戏',
        description:
          '用户在抖音企业号游戏里通过操控汽车躲避障碍完成竞速游戏，通过任务获得抽奖机会，抽奖可以获得实物奖励。游戏任务既能满足品牌广告主的深度经营诉求，同时可以增加用户与品牌的深度互动。目前已经下单客户有：岚图、领克',
        caseUrl:
          'https://v6-default.ixigua.com/88026d699e8b9b3206544b8acb77df0a/7420422a/video/tos/cn/tos-cn-v-736065/aa263b87189440d4b000846d4822e9e5/?a=0&br=1499&bt=1499&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7T-CKkYi&l=202109291824310102121501662201E94B&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=am9uZTU6Zm02ODQzNDg1M0ApeDZ5Ong6ZXdkZjMzajw1eWdyMHM0cjRfcV5gLS1kNi9zc2RpaF8vNGBnMDIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['深度经营游戏'],
        data: [],
      },
      {
        title: 'DOU+流量矿工游戏',
        description:
          '核心玩法为矿工（机器人）通过每天在星球挖矿，获得流量、金币、道具，用户可以不断升级矿工，换取dou+流量购买优惠券，从而增加用户粘性，帮助dou+的用户增长',
        caseUrl:
          'https://v3-default.ixigua.com/09da2639730f35384d5c85ca45c5af88/74203380/video/tos/cn/tos-cn-v-736065/b12f1506c6f6454d93b1dbeeee2d458c/?a=0&br=1227&bt=1227&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=4&er=0&ft=uSx5SggtInz7TWlKkYi&l=20210929172222010212204020274F485D&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=anhwbTo6Zmk0ODQzNDg1M0ApeGxrZHg6bWtkZjMzajw1eWdyZmVecjRnZV5gLS1kNi9zc2Ryamc0NGBjLjIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['增长游戏'],
        data: [{ number: '1.39', unit: '', name: 'ROI' }],
      },
    ],
  },
  {
    title: '创意管理中心',
    description: '多类型、多维度的管理能力轻松实现创意高效管理',
    keyFrameUrl:
      'https://p6-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/9ac98bff5cec4ed0b9c1502bc45f78cd.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1966496820&x-signature=Sw6XRyLZTOg1zs9IGoeMqdOxZqo%3D',
    keyFrameSelectUrl:
      'https://p6-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/9ac98bff5cec4ed0b9c1502bc45f78cd.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1966496820&x-signature=Sw6XRyLZTOg1zs9IGoeMqdOxZqo%3D',
    routePath: '/creative/ai',
    solutionPath: '/solution?solutionId=ai',
    showcase: [
      {
        title: 'AI识别视频高光时刻',
        description:
          '根据对大量直播视频、短视频的学习、理解、识别，制作高光时刻视频；降低优质素材生产成本，提升引流效果',
        caseUrl: 'https://lf3-cdn-tos.bytescm.com/obj/union-fe/creative-engine/showcase/ai-synthesis-1.mp4',
        tags: ['AI识别'],
        data: [],
      },
    ],
  },
  {
    title: '创意数据披露',
    description: '互动创意数据可视化，支持实时数据监控和报警',
    keyFrameUrl:
      'https://p3-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/71c5118c50bf49f8a61667be87dd8f0b.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1966496870&x-signature=2hd%2F2pY9oV%2FZW5mNFfZg%2Fdv1wy4%3D',
    keyFrameSelectUrl:
      'https://p3-addone-sign.byteimg.com/tos-cn-i-hhc0kcolqq/71c5118c50bf49f8a61667be87dd8f0b.png~tplv-hhc0kcolqq-image-v6:q75.image?x-expires=1966496870&x-signature=2hd%2F2pY9oV%2FZW5mNFfZg%2Fdv1wy4%3D',
    routePath: '/creative/playable',
    solutionPath: '/solution?solutionId=playable',
    showcase: [
      {
        title: '摇动彩蛋互动广告样式',
        description:
          '业内首创开机第一位摇动彩蛋，增强广告趣味性，有效激发用户参与互动，提升品牌力；双重路径实现高点击、强引流，提升落地页到达量。目前已下单客户有：彩虹糖、欧莱雅、康师傅冰红茶等',
        caseUrl:
          'https://v3-default.ixigua.com/f0d9d3b5a1d5eee454a381e98017e201/74206bb6/video/tos/cn/tos-cn-v-736065/59c24b50ab1d4600b9ee576778ef1d5a/?a=0&br=4698&bt=4698&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=&er=0&ft=uSx5SggtInz7TomDkYi&l=202109292122520102100982182124CCCC&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=anV3OGk6Zjg5ODQzNDg1M0ApcjxveHg6ZWtkZjMzajw1eWdsNmlycjRfZV5gLS1kNi9zc2RvcTJjNGAyMzIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [
          { number: '6', unit: '%+', name: 'CTR最高达' },
          { number: '5', unit: '%+', name: '互动比例高达' },
        ],
      },
      {
        title: 'AR互动广告样式',
        description:
          '在广告上为AR技术寻找应用场景，让用户在真实场景当中进行游戏体验，电商购物等，增强广告的沉浸式互动体验，给用户带来身临其境的感受，进一步提升广告转化',
        caseUrl:
          'https://v6-default.ixigua.com/13294df66cddb74e6ece25ba538258fa/74203041/video/tos/cn/tos-cn-v-736065/deb27d21b42048c98eb2874e8320d1c3/?a=0&br=1085&bt=1085&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TMbWkYi&l=202109291708530102112070910404FAB5&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M25qa2U6Znk1ODQzNDg1M0ApNjN3cXg6ZXNkZjMzajw1eWcwLXFrcjRfbV5gLS1kNi9zcy1oZGVfNGBzLzIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [
          { number: '600', unit: 'w+', name: '最高广告总曝光' },
          { number: '33', unit: '%+', name: '最高转化率' },
        ],
      },
      {
        title: '一镜到底互动广告样式',
        description:
          '通过彩蛋联动将“品牌广告”和“达人内容”进行串联，同时满足客户品牌宣传、内容种草及转化等需求，提升广告互动性、趣味性设计demo',
        caseUrl:
          'https://v3-default.ixigua.com/16b82db5c4cbe3b0b20ecaf221494870/74204a45/video/tos/cn/tos-cn-v-736065/b4ad3257ac7943bda69b944784194d30/?a=0&br=9198&bt=9198&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TnqVkYi&l=202109291859560102100511620A0AFD3E&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M3hwNDM6ZnA3ODQzNDg1M0ApbGxtOHg6NmVkZjMzajw1eWdmZmcycjQwX15gLS1kNi9zcy1yai4tNGBqMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [],
      },
      {
        title: '神灯互动广告样式',
        description:
          '通过长按、滑动等手势交互，唤起沉浸式彩蛋，有效提升用户参与度，提升品牌印象价值，目前已下单客户：vivo、宝马、网易梦幻西游等',
        caseUrl:
          'https://v6-default.ixigua.com/11b4d47b75725b53b193f197f0bd282d/74204956/video/tos/cn/tos-cn-v-736065/92d0dc9eb2cc4bcc858709455606e2f4/?a=0&br=6954&bt=6954&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7T5XVkYi&l=202109291856070102100511620A0AC3CB&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=Mzxwczs6Zmw3ODQzNDg1M0ApcHlncng6NmVkZjMzajw1eWdqc2FscjQwX15gLS1kNi9zcy02am01NGBmMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [],
      },
      {
        title: '裸眼3D互动广告样式',
        description:
          '将裸眼3D玩法融入到广告样式中，增加广告主品牌露出的权益，提升品牌印象价值；提供多次互动引导，提升转化率。目前已下单客户：vivo、MAC、雅诗兰黛等',
        caseUrl:
          'https://v3-default.ixigua.com/20dadfa6381b9bd9abf436a72bbff53a/742049ac/video/tos/cn/tos-cn-v-736065/ae43046d2dae426c8717359f288f98c0/?a=0&br=5339&bt=5339&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TFxVkYi&l=202109291857250102100511620A0AD946&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=ajo5MzM6ZnA3ODQzNDg1M0ApOTx2NHg6NmVkZjMzajw1eWczNnAucjQwX15gLS1kNi9zc2Q0My0tNGBqMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动广告创意'],
        data: [],
      },
      {
        title: '捏捏软糖脸互动拍摄道具',
        description:
          '在抖音商业化拍摄器内录制道具视频，用户通过触碰屏幕边缘的手，来捏出脸上的彩虹糖，面部产生变形效果，结果得分生成并计算排名，实现裂变营销。目前已下单客户：箭牌彩虹糖',
        caseUrl:
          'https://v6-default.ixigua.com/39120f2bcfed274e7f45559eb878fce5/742049f3/video/tos/cn/tos-cn-v-736065/68de908c2365441084f980773239a349/?a=0&br=9751&bt=9751&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TZDVkYi&l=202109291858420102100511620A0AE83C&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=MzU7eGY6Zmw3ODQzNDg1M0ApbjdyO3g6NmVkZjMzajw1eWdoMWw1cjQwX15gLS1kNi9zcy0vNXJgNGBmMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动道具创意'],
        data: [],
      },
      {
        title: '接面具互动拍摄道具',
        description:
          '在抖音商业化拍摄器内录制道具游戏的视频，用户通过移动脸部来接掉落的气泡面具，挑战结束后自动跳转至发布器鼓励用户发布游戏视频，实现裂变营销。目前已下单客户：纯水乐气泡水',
        caseUrl:
          'https://v3-default.ixigua.com/c38a846bfb0370ebe83417d4e395d1e2/74204a81/video/tos/cn/tos-cn-v-736065/c57512f1a57f45c99ec22494a08a6a97/?a=0&br=9743&bt=9743&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TA7VkYi&l=202109291900580102100511620A0B141E&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=ajs1bWY6ZnA3ODQzNDg1M0ApZTNrO3g6NmVkZjMzajw1eWdfLWU1cjQwX15gLS1kNi9zc2Q1L2dgNGBqMTIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动道具创意'],
        data: [],
      },
      {
        title: '画一画互动直播玩法',
        description:
          '用抽奖和游戏的双重利益吸引用户，让用户通过描绘广告主体物轮廓的互动游戏，广告完成品牌透传的同时实现了广告转化。目前已下单客户：奥迪、央视财经-汽车、哈佛SUV等',
        caseUrl:
          'https://v6-default.ixigua.com/30a83d7cd193274a144ab604e6824cb2/74203259/video/tos/cn/tos-cn-v-736065/017f5437909749989807a1304311427c/?a=0&br=1561&bt=1561&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TQiWkYi&l=20210929171750010212204020274EFA39&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M3FoM2Y6Zmk0ODQzNDg1M0ApZXV2aXg6bWtkZjMzajw1eWdfb3BjcjRnZV5gLS1kNi9zcy1rYi1gNGBjLjIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动直播创意'],
        data: [],
      },
      {
        title: '摇钱树互动直播玩法',
        description: '通过摇动摇钱树的互动玩法参与活动，完成品牌透传，提升用户的参与度并拉长用户观看时长',
        caseUrl:
          'https://v3-default.ixigua.com/32f2575fe8fbd87bade7eb7f308cdfd4/742054c5/video/tos/cn/tos-cn-v-736065/9b388f399b4542d6b714b5b02b7921c8/?a=0&br=1158&bt=1158&cd=0%7C0%7C0&ch=0&cr=0&cs=0&dr=0&ds=3&er=0&ft=uSx5SggtInz7TbP9kYi&l=20210929194414010211181134105AD2DA&lr=default&mime_type=video_mp4&net=0&pl=0&qs=13&rc=M2tybjo6Znk4ODQzNDg1M0ApdHlwdHg6NjVkZjMzajw1eWduc2pucjQwL15gLS1kNi9zcy1lbGg0NGBzMjIuLS4yLy06Yw%3D%3D&vl=&vr=',
        tags: ['互动直播创意'],
        data: [],
      },
    ],
  },
];

const HOMEPAGE_SHOWCASE: IShowCaseItem[] = [
  {
    title: '游戏化营销',
    description:
      '以“金币”、“深度经营”、“产品增长” 三种营销类游戏为手段，帮助产品增加用户粘性，带来用户增长，进而实现流量变现或深度经营',
    moreCasePath: '',
    showcase: [
      {
        title: 'dou+用户增长游戏化营销',
        description:
          '核心玩法为矿工（机器人）通过每天在星球挖矿，获得流量、金币、道具，用户可以不断升级矿工，换取dou+流量购买优惠券，从而增加用户粘性，帮助dou+的用户增长',
        caseUrl:
          'https://v3-default.ixigua.com/01b87605dc8c80ac5ca73c1fb3073be8/753682b7/video/tos/cn/tos-cn-v-736065/38cd23e7edbd4e64b4c48e77ef027b05/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=1227&bt=1227&cs=0&ds=4&ft=dlfYl--bz7ThW9d~s1t8Z&mime_type=video_mp4&qs=13&rc=anRsczo6ZnY6PDQzNDg1M0BpanRsczo6ZnY6PDQzNDg1M0BkZmZgcjRncmlgLS1kNi9zYSNkZmZgcjRncmlgLS1kNi9zcw%3D%3D&l=20220428195029010210077041062A6865',
        tags: ['增长游戏'],
        data: [{ number: '1.39', unit: '', name: 'ROI' }],
      },
      {
        title: '奥迪汽车竞速游戏化营销',
        description:
          '用户在抖音企业号游戏里通过操控骑车躲避障碍完成竞速游戏，通过任务获得抽奖机会，抽奖可以获得实物奖励。游戏任务既能满足品牌广告主的深度经营诉求，同时可以增加用户与品牌的深度互动。目前已经下单客户有：岚图、领克',
        caseUrl:
          'https://v3-default.ixigua.com/1eee350580081083b9e53cf9b1919c03/75368326/video/tos/cn/tos-cn-v-736065/c291a7e920a64f7389a69287ba8864a3/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=1499&bt=1499&cs=0&ds=3&ft=dlfYl--bz7ThW1U~s1t8Z&mime_type=video_mp4&qs=13&rc=amdrcmc6ZnY6PDQzNDg1M0Bpamdrcmc6ZnY6PDQzNDg1M0BpbXFfcjRncmlgLS1kNi9zYSNpbXFfcjRncmlgLS1kNi9zcw%3D%3D&l=20220428195154010210077041062A6B90',
        tags: ['汽车竞速游戏', '深度经营游戏'],
        data: [],
      },
      {
        title: '千川年货节客增会场游戏化',
        description:
          '游戏化的互动任务与奖励形式，可以更好地引导用户在会场持续活跃并解锁相应权益，同时达到广泛宣传千川品牌的效果',
        caseUrl:
          'https://v9-default.ixigua.com/e6da26baf56a6afccd509f8d44bcf06e/7536882a/video/tos/cn/tos-cn-v-736065/d9649c4f9e30484898add6c9c31f346d/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=2104&bt=2104&cs=0&ds=4&ft=dlfYl--bz7ThW2-rs1t8Z&mime_type=video_mp4&qs=13&rc=ang0bjQ6ZnY7PDQzNDg1M0Bpang0bjQ6ZnY7PDQzNDg1M0AucTVwcjRfNmlgLS1kNi9zYSMucTVwcjRfNmlgLS1kNi9zcw%3D%3D&l=202204282014020102120400441C2BED29',
        tags: ['创意营销'],
        data: [],
      },
    ],
  },
  {
    title: '互动广告',
    description:
      '不断探索“新技术、新交互、新玩法”，进一步将其沉淀为中台能力后，大范围应用到信息流广告、拍摄道具、直播间等场景',
    moreCasePath: '',
    showcase: [
      {
        title: '抖音视频+互动落地',
        description:
          '以互动的形式展示游戏的核心玩法，轻松触达目标用户，有效提高用户投入度，快速提升游戏产品的竞价能力，平均转化率可提升3倍左右',
        caseUrl:
          'https://v3-default.ixigua.com/379a24d6ed9f2780579a5288ffc64963/753689dc/video/tos/cn/tos-cn-v-736065/3b8b9f4fdce14eab8bda49d3d6252232/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=11804&bt=11804&cs=0&ds=4&ft=dlfYl--bz7ThWJfrs1t8Z&mime_type=video_mp4&qs=13&rc=M2k6N2Q6ZnU7PDQzNDg1M0BpM2k6N2Q6ZnU7PDQzNDg1M0AuXjRfcjRfMmlgLS1kNi9zYSMuXjRfcjRfMmlgLS1kNi9zcw%3D%3D&l=20220428202108010015017154052B70FD',
        tags: ['互动游戏创意'],
        data: [],
      },
      {
        title: '抖音直出互动落地页',
        description:
          '直出互动为用户创造身临其境的深度体验，让用户可以在信息流中直接进入互动玩法。不需结合视频创意，一套互动创意即可迅速触及用户兴趣点，提升转化效率',
        caseUrl:
          'https://v9-default.ixigua.com/279e0c5b0ce845ea69cdc639ae891513/75368ac8/video/tos/cn/tos-cn-v-736065/1d36c4a738994786a581553dcb7a5340/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=2464&bt=2464&cs=0&ds=6&ft=dlfYl--bz7ThWzhrs1t8Z&mime_type=video_mp4&qs=13&rc=am9scTc6ZnU7PDQzNDg1M0Bpam9scTc6ZnU7PDQzNDg1M0AzL3FpcjRfMmlgLS1kNi9zYSMzL3FpcjRfMmlgLS1kNi9zcw%3D%3D&l=20220428202413010212075200232469CD',
        tags: ['直出互动创意'],
        data: [],
      },
      {
        title: '穿山甲轻互动',
        description:
          '轻互动创意形式逻辑简单，互动玩法多样，在丰富广告内容的同时，更易触达用户，参与门槛低，短时间内便可吸引用户参与，轻松提升产品转化率',
        caseUrl:
          'https://v3-default.ixigua.com/881f1d33192eedd008e5611a5b815098/75368aca/video/tos/cn/tos-cn-v-736065/7548990bcbac48b19867c9e7d720b05a/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=1824&bt=1824&cs=0&ds=3&ft=dlfYl--bz7ThWKzrs1t8Z&mime_type=video_mp4&qs=13&rc=M2Y2eWY6ZnU7PDQzNDg1M0BpM2Y2eWY6ZnU7PDQzNDg1M0BvNm9xcjRfMmlgLS1kNi9zYSNvNm9xcjRfMmlgLS1kNi9zcw%3D%3D&l=2022042820253801021207520023246CFB',
        tags: ['轻互动创意'],
        data: [],
      },
      {
        title: '彩虹糖3D摇一摇',
        description:
          '业内首创开机第一位摇动彩蛋，增强广告趣味性，有效激发用户参与互动，提升品牌力；双重路径实现高点击、强引流，提升落地页到达量。目前已下单客户有：彩虹糖、欧莱雅、康师傅冰红茶等',
        caseUrl:
          'https://v9-default.ixigua.com/d47c123aa9a0df56598ef06368744b33/7536877d/video/tos/cn/tos-cn-v-736065/248a5f51737f409cb3abac1ef223dc7d/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=9426&bt=9426&cs=0&ds=4&ft=dlfYl--bz7ThWqnrs1t8Z&mime_type=video_mp4&qs=13&rc=ajdlOjQ6ZnU7PDQzNDg1M0BpajdlOjQ6ZnU7PDQzNDg1M0Ayai5kcjRnMmlgLS1kNi9zYSMyai5kcjRnMmlgLS1kNi9zcw%3D%3D&l=202204282011160102120400441C2BE060',
        tags: ['互动广告创意'],
        data: [
          { number: '6', unit: '%+', name: 'CTR最高达' },
          { number: '5', unit: '%+', name: '互动比例高达' },
        ],
      },
      {
        title: '电商AR任意门',
        description:
          'AR互动形式让用户随时随地即可开启购物之旅，充分拉近用户与品牌之间的距离。沉浸式体验，多样式玩法让品牌营销更有趣',
        caseUrl:
          'https://v6-default.ixigua.com/197c91e06b264639eadf95a47b716744/75368c49/video/tos/cn/tos-cn-v-736065/9ed539ca2fcb4f47ae7809ddb00091a4/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=7901&bt=7901&cs=0&ds=4&ft=dlfYl--bz7ThWLRrs1t8Z&mime_type=video_mp4&qs=13&rc=M3R2ajw6ZnU7PDQzNDg1M0BpM3R2ajw6ZnU7PDQzNDg1M0A2cF4ycjRfMmlgLS1kNi9zYSM2cF4ycjRfMmlgLS1kNi9zcw%3D%3D&l=202204282031470102120391462B31580A',
        tags: ['AR品牌互动'],
        data: [],
      },
      {
        title: '视频流3D看车',
        description: '视频与互动完美融合，点亮品牌高光时刻，以互动解锁视频新体验，让沉浸式观看体验推动产品转化率提升',
        caseUrl:
          'https://v3-default.ixigua.com/698300bfc25737844c80ec448d6a7634/75368d11/video/tos/cn/tos-cn-v-736065/00db3f826eb748a8b17b881ce1bb665e/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=8137&bt=8137&cs=0&ds=4&ft=dlfYl--bz7ThWzCrs1t8Z&mime_type=video_mp4&qs=13&rc=Mzo4dWk6ZnU7PDQzNDg1M0BpMzo4dWk6ZnU7PDQzNDg1M0BnbGxocjRfMmlgLS1kNi9zYSNnbGxocjRfMmlgLS1kNi9zcw%3D%3D&l=20220428203453010212160033172BA668',
        tags: ['3D互动创意'],
        data: [],
      },
    ],
  },
  {
    title: '互动组件',
    description:
      '将感性的美学认知参数化，形成体系化的AI训练规则，不断训练AI自动化识别、切分、生产符合美学标准的创意素材',
    moreCasePath: '',
    showcase: [
      {
        title: '千川双十一活动互动组件',
        description: '效果丰富的弹窗组件，适合多种营销活动，激励用户参与活动，推动用户完成营销任务，提升活动效果',
        caseUrl:
          'https://v6-default.ixigua.com/ffc6535c65969f5bb3c67991d6c1c2fb/753f4ba3/video/tos/cn/tos-cn-v-736065/68c34443711448c0a2f87c84ff070674/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=681&bt=681&cs=0&ds=4&ft=dlfYl--bz7ThW10Ko1t8Z&mime_type=video_mp4&qs=13&rc=M2xnamc6ZnNuPDQzNDg1M0BpM2xnamc6ZnNuPDQzNDg1M0BsZjAucjQwZG1gLS1kNi9zYSNsZjAucjQwZG1gLS1kNi9zcw%3D%3D&l=2022050511463501021004104622814D96',
        tags: ['互动奖励弹窗'],
        data: [],
      },
      {
        title: '懂车帝信息流3D看车组件',
        description:
          '轻量化的3D实时渲染技术让用户在浏览场景下即可开启看车互动，创意效果不受场景限制，让优秀的渲染效果及渲染性能轻松提升用户体验与品牌价值',
        caseUrl:
          'https://v6-default.ixigua.com/6184de7b8c73dde79b04b82eb20d04e9/753f4bde/video/tos/cn/tos-cn-v-736065/6446e4a724a647b4983ce3d29e107f38/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=1685&bt=1685&cs=0&ds=3&ft=dlfYl--bz7ThWr4Ko1t8Z&mime_type=video_mp4&qs=13&rc=anU5djU6Zjx0PDQzNDg1M0BpanU5djU6Zjx0PDQzNDg1M0ByNi9gcjRnY2lgLS1kNi9zYSNyNi9gcjRnY2lgLS1kNi9zcw%3D%3D&l=2022050511472601021004104622815000',
        tags: ['信息流互动卡片'],
        data: [],
      },
      {
        title: '懂车帝信息流粒子组件',
        description: '微互动粒子效果组件让品牌宣传更吸睛，轻松营造节日氛围，建立品牌信任，触达目标用户,让用户记住品牌',
        caseUrl:
          'https://v3-default.ixigua.com/989edb2995932f280761d51d652f0be0/753f4c2b/video/tos/cn/tos-cn-v-736065/3174e820fc8a49ec901f2687fca5c2a4/?a=0&ch=0&cr=0&dr=0&er=0&lr=default&cd=0%7C0%7C0%7C0&br=1291&bt=1291&cs=0&ds=3&ft=dlfYl--bz7ThWMRKo1t8Z&mime_type=video_mp4&qs=13&rc=M2pva2k6Zjx0PDQzNDg1M0BpM2pva2k6Zjx0PDQzNDg1M0BsLWlfcjRnY2lgLS1kNi9zYSNsLWlfcjRnY2lgLS1kNi9zcw%3D%3D&l=202205051148340102100410462281518A',
        tags: ['微互动卡片'],
        data: [],
      },
    ],
  },
];

const KEY_FRAME = [0, 1.16, 2.9, 4.74, 6.4];
const KEY_FRAME_REVERSE = [0, 1.17, 2.95, 4.77, 6.4];
const HOMEPAGE_TECHNOLOGY: IHomepageTechnologyItem[] = [
  {
    title: '游戏化营销',
    description: '把游戏的思维和机制引入到产品和营销中，引导用户互动，增加受众的参与度、忠诚度和乐趣',
    detail: [
      {
        title: '互动创意类型',
        description: '2D、3D、AR',
      },
    ],
    routePath: '/game',
    forward: {
      videoCurrentTime: KEY_FRAME[1],
      reverseVideoCurrentTime: KEY_FRAME_REVERSE[3],
      videoEndTime: KEY_FRAME[2] - KEY_FRAME[1],
    },
  },
  {
    title: '互动广告 - 效果类',
    description: '以0-30s时长为主的更有趣味性的沉浸式可玩的互动创意形式，提升高转化效果和留存率',
    detail: [
      {
        title: '互动创意类型',
        description: '2D、3D、全景、交互视频、VR、AR',
      },
    ],
    routePath: '/advertise',
    forward: {
      videoCurrentTime: KEY_FRAME[2],
      reverseVideoCurrentTime: KEY_FRAME_REVERSE[2],
      videoEndTime: KEY_FRAME[3] - KEY_FRAME[2],
    },
    reverse: {
      videoCurrentTime: KEY_FRAME[1],
      reverseVideoCurrentTime: KEY_FRAME_REVERSE[3],
      videoEndTime: KEY_FRAME_REVERSE[4] - KEY_FRAME_REVERSE[3],
    },
  },
  {
    title: '互动广告 - 品牌类',
    description: '通过互动形式和品牌产品结合起来，在互动中加深用户对品牌价值的认知，提升转化效果',
    detail: [
      {
        title: '互动创意类型',
        description: '2D、3D、全景、VR、AR',
      },
    ],
    routePath: '/advertise',
    forward: {
      videoCurrentTime: KEY_FRAME[3],
      reverseVideoCurrentTime: KEY_FRAME_REVERSE[1],
      videoEndTime: KEY_FRAME[4] - KEY_FRAME[3],
    },
    reverse: {
      videoCurrentTime: KEY_FRAME[2],
      reverseVideoCurrentTime: KEY_FRAME_REVERSE[2],
      videoEndTime: KEY_FRAME_REVERSE[3] - KEY_FRAME_REVERSE[2],
    },
  },
  {
    title: '互动组件',
    description: '以简单的互动组件效果在各种场景中达到吸引用户焦点的目的，提升用户认知和印象',
    detail: [
      {
        title: '互动创意类型',
        description: '2D、3D、AR',
      },
    ],
    routePath: '/component',
    reverse: {
      videoCurrentTime: KEY_FRAME[3],
      reverseVideoCurrentTime: KEY_FRAME_REVERSE[1],
      videoEndTime: KEY_FRAME_REVERSE[2] - KEY_FRAME_REVERSE[1],
    },
  },
];

class HomepageService {
  getHomepageCreative() {
    return HOMEPAGE_CREATIVE;
  }

  getHomepageTechnology() {
    return HOMEPAGE_TECHNOLOGY;
  }

  getHomepageShowCase() {
    return HOMEPAGE_SHOWCASE;
  }
}

export const homepageService = new HomepageService();
