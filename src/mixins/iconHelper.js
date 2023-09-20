export default {
    methods: {
        containsSvg(icon) {
            // Regular expression to match a URL pattern
            const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)((?:\/[\w@?^=%&:/~+#-]*)*)?$/;
      
            // Regular expression to check if the string contains '.svg'
            const svgPattern = /\.svg/;
      
            // Check if the variable is a string and either a URL or contains '.svg'
            return typeof icon === 'string' && (urlPattern.test(icon) || svgPattern.test(icon));
        }
    },
}