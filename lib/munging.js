// shape the font data 

function formatFontList(fontData) {

  const shapedResponse = fontData.items.map(item => {
    return {
      name: item.family,
      link: `https://fonts.google.com/specimen/${item.family}?preview.text_type=custom`,
      category: item.category,
      variants: item.variants,
      subsets: item.subsets      
    };
  });

  return shapedResponse;
}

module.exports = { formatFontList };