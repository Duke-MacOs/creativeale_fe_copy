import douyin from './logos/douyin.png';
import chuanshanjia from './logos/chuanshanjia.png';
import fanqie from './logos/fanqie.png';
import xigua from './logos/xigua.png';
import dongchedi from './logos/dongchedi.png';

import './style.less';

const business = [
  [
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/1f0fc360045649a2bafcb1ac8a424916~tplv-hhc0kcolqq-image.image',
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/347cdce5d92748afa32fb319284297f3~tplv-hhc0kcolqq-image.image',
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/91b83d1ca89b455c8a95d5a735f06c6f~tplv-hhc0kcolqq-image.image',
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/554567852b454482bd009f4a8ae7cbe8~tplv-hhc0kcolqq-image.image',
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/26064316066849e7b291317d2f61915f~tplv-hhc0kcolqq-image.image',
  ],
  [
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/a9efb7e020d047a78e22468169aad74c~tplv-hhc0kcolqq-image.image',
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/e5a61821047145d0831900468abae346~tplv-hhc0kcolqq-image.image',
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/dd533ef21cf34591ab10295c376047ba~tplv-hhc0kcolqq-image.image',
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/625e25a7c7f74afa87d847da56dbcd22~tplv-hhc0kcolqq-image.image',
    'https://p6-addone.byteimg.com/tos-cn-i-hhc0kcolqq/fb35af42e1e84353a143b8a96a726ac5~tplv-hhc0kcolqq-image.image',
  ],
];

export default function HomepageJoinUs() {
  return (
    <div className="homepage-join-wrapper">
      <div className="homepage-join-title">与他们一起加入</div>
      <div className="flex-row-space-between">
        {[douyin, chuanshanjia, fanqie, xigua, dongchedi].map((item, index) => (
          <div className="homepage-join-logo-wrapper" key={index}>
            <img src={item} />
          </div>
        ))}
      </div>
      <div>
        {business?.map((businessGroup, groupIndex) => (
          <div key={groupIndex} className="flex-row-space-between">
            {businessGroup.map((item, index) => (
              <img className="homepage-join-logo" key={index} src={item} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
