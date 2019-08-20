const { DOMParser } = require('xmldom')

const getSvgAttrs = xml => {
  const svg = xml.getElementsByTagName('svg')[0]
  return {
    viewBox: svg.getAttribute('viewBox')
  }
}

const getShapeAttrs = (xml, shape, attrs = []) => {
  const elems = xml.getElementsByTagName(shape)
  const result = []

  for (let i = 0; i < elems.length; i++) {
    const attr = {}
    attrs.forEach(item => {
      attr[item] = elems[i].getAttribute(item)
    })
    result.push(attr)
  }
  return result
}

const getSvgShapes = xml => {
  const resutl = {}
  const shapes = {
    rect: ['x', 'y', 'width', 'height'],
    circle: ['cx', 'cy', 'r'],
    ellipse: ['cx', 'cy', 'rx', 'ry'],
    line: ['x1', 'x2', 'y1', 'y2'],
    polyline: ['points'],
    polygon: ['points'],
    path: ['d']
  }

  for (let key in shapes) {
    const attrs = getShapeAttrs(xml, key, shapes[key])
    if (attrs && attrs.length) {
      resutl[key] = attrs
    }
  }

  return resutl
}

module.exports = svg => {
  const svgXML = new DOMParser().parseFromString(svg, 'application/xml')
  return Promise.resolve({
    attrs: getSvgAttrs(svgXML),
    shapes: getSvgShapes(svgXML)
  })
}
