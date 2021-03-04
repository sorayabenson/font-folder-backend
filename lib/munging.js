// shape the font data 

function formatFontList(fontData) {

  const shapedResponse = fontData.items.map(item => {
    const regex = /\s/gm;
    const str = `${item.family}`;
    const subst = '+';
    const urlName = str.replace(regex, subst);
    
    return {
      name: item.family,
      link: `https://fonts.google.com/specimen/${urlName}?preview.text_type=custom`,
      category: item.category,
      variants: item.variants,
      subsets: item.subsets      
    };
  });

  return shapedResponse;
}

module.exports = { formatFontList };

// to stringify as an object in case arrays mess things up: variants: `{${item.variants}}`,
