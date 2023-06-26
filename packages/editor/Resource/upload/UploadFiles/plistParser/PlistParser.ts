class SAXParser {
  private _parser: DOMParser | undefined;
  private _isSupportDOMParser: boolean;
  constructor() {
    if (window.DOMParser) {
      this._isSupportDOMParser = true;
      this._parser = new DOMParser();
    } else {
      this._isSupportDOMParser = false;
    }
  }

  parse(xmlTxt: string): any {
    return this._parseXML(xmlTxt);
  }

  _parseXML(textxml: string): any {
    // get a reference to the requested corresponding xml file
    let xmlDoc: any;
    if (this._isSupportDOMParser && this._parser) {
      xmlDoc = this._parser.parseFromString(textxml.replace(/^\s*/g, ''), 'text/xml');
    } else {
      // Internet Explorer (untested!)
      xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = 'false';
      xmlDoc.loadXML(textxml);
    }
    return xmlDoc;
  }
}

class PlistParser extends SAXParser {
  /**
   * parse a xml string as plist object.
   * @param {String} xmlTxt - plist xml contents
   * @return {*} plist object
   */
  parse(xmlTxt: string): any {
    let xmlDoc = this._parseXML(xmlTxt);
    const plist = xmlDoc.documentElement;
    if (plist.tagName !== 'plist') {
      return {};
    }

    // Get first real node
    let node = null;
    for (let i = 0, len = plist.childNodes.length; i < len; i++) {
      node = plist.childNodes[i];
      if (node.nodeType === 1) break;
    }
    xmlDoc = null;
    return this._parseNode(node);
  }

  private _parseNode(node: any) {
    let data = null;
    const tagName = node.tagName;
    if (tagName === 'dict') {
      data = this._parseDict(node);
    } else if (tagName === 'array') {
      data = this._parseArray(node);
    } else if (tagName === 'string') {
      if (node.childNodes.length === 1) data = node.firstChild.nodeValue;
      else {
        //handle Firefox's 4KB nodeValue limit
        data = '';
        for (let i = 0; i < node.childNodes.length; i++) data += node.childNodes[i].nodeValue;
      }
    } else if (tagName === 'false') {
      data = false;
    } else if (tagName === 'true') {
      data = true;
    } else if (tagName === 'real') {
      data = parseFloat(node.firstChild.nodeValue);
    } else if (tagName === 'integer') {
      data = parseInt(node.firstChild.nodeValue, 10);
    }
    return data;
  }

  private _parseArray(node: any): Array<any> {
    const data = [];
    for (let i = 0, len = node.childNodes.length; i < len; i++) {
      const child = node.childNodes[i];
      if (child.nodeType !== 1) continue;
      data.push(this._parseNode(child));
    }
    return data;
  }

  private _parseDict(node: any): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    let key = '';
    for (let i = 0, len = node.childNodes.length; i < len; i++) {
      const child = node.childNodes[i];
      if (child.nodeType !== 1) continue;

      // Grab the key, next noe should be the value
      if (child.tagName === 'key') key = child.firstChild.nodeValue;
      else data[key] = this._parseNode(child); // Parse the value node
    }
    return data;
  }
}

export default PlistParser;
