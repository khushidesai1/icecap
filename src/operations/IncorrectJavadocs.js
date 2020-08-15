/**
 * IncorrectJavadocs class that marks existing
 * javadocs based on their correctness.
 */
export default class IncorrectJavadocs {

    /**
     * Default constructor for the IncorrectJavadocs 
     * class. 
     */
    constructor() {
        this.methodPattern = new RegExp(
            "(\\p{Space})*(public |protected |private )?" +
            "(static )?" +
            "(void |[\\w\\W]+ )" +
            "([a-zA-Z0-9]+)" +
            "\\(" +
            "(([\\w\\W]+ [a-zA-Z0-9]+)|" +
            "(([\\w\\W]+ [a-zA-Z0-9]+, )+[\\w\\W]+ [a-zA-Z0-9]+))?" + 
            "\\) ?\\{");
        this.classPattern = new RegExp(
            "(\\p{Space})*(public |protected |private )?" +
            "(static )?" + 
            "(class )" +
            "(extends |implements )?" +
            "([a-zA-Z0-9]+) ?\\{"
        );
    }

    /**
     * Marks existing javadocs based on whether they are 
     * following the cs 61b style guidelines.
     * @param {String} content the content of the original file.
     */
    markIncorrectJavadocs(content) {
        var fileContent = "";
        var javadocFound = false;
        var lineNum = 1;
        var javadoc = "";
        var lines = content.split("\n");
        var numLines = lines.length;
        var overrideFound = false;
        var i;
        for (i = 0; i < lines.length; i++) {
            var line = lines[i];
            var newline = "";
            if (lineNum < numLines) {
                newline = "\n";
            }
            var lineTrim = line.trim();
            if (line.trim() === "@Override") {
                overrideFound = true;
                fileContent += line + newline;
            } else if (!lineTrim.startsWith("/**") && lineTrim.startsWith("/*")) {
                fileContent += line + newline;
            } else if (lineTrim.startsWith("/**") && lineTrim.endsWith("*/")) {
                javadocFound = false;
                javadoc += line + newline;
            } else if (lineTrim.startsWith("/**")) {
                javadocFound = true;
                javadoc += line + newline;
            } else if (lineTrim.endsWith("*/")) {
                if (javadocFound) {
                    javadocFound = false;
                    javadoc += line + newline;
                } else {
                    fileContent += line + newline;
                }
            } else if (javadocFound) {
                javadoc += line + newline;
            } else if (line === "" || lineTrim === "") {
                fileContent += line + newline;
            } else if (this.methodPattern.exec(lineTrim)) {
                if (!overrideFound) {
                    if (javadoc !== "") {
                        if (this.validateJavadocComment(line, javadoc)) {
                            fileContent += javadoc;
                        } else {
                            fileContent += "------- INCORRECT JAVADOC FORMAT -------\n";
                            fileContent += javadoc;
                            fileContent += "----------------------------------------\n";
                        }
                        fileContent += line + newline;
                        javadoc = "";
                    } else {
                        fileContent += line + newline;
                    }
                } else {
                    fileContent += line + newline;
                }
            } else if (this.classPattern.exec(line)) {
                if (javadoc !== "") {
                    if (this.validateClassJavadocComment(javadoc)) {
                        fileContent += javadoc;
                    } else {
                        fileContent += "------- ADD @AUTHOR TAG TO JAVADOC -------\n";
                        fileContent += javadoc;
                        fileContent += "----------------------------------------\n";
                    }
                    fileContent += line + newline;
                    javadoc = "";
                } else {
                    fileContent += line + newline;
                }
            } else {
                if (javadoc !== "") {
                    fileContent += javadoc + newline;
                }
                fileContent += line + newline;
                javadoc = "";
            }
            lineNum++;
        }
        return fileContent;
    }

    /**
     * Returns true if the provided javadoc comment and 
     * the header are of correct format according 
     * to the style guide and false otherwise.
     * @param {String} header the method header.
     * @param {String} javadocComment the provided javadoc comment.
     */
    validateJavadocComment(header, javadocComment) {
        var returnVal = this.containsReturn(header);
        var paramNames = this.getParamList(header);
        var javadocLower = javadocComment.toLowerCase();
        if (returnVal) {
            if (!(javadocLower.includes("@return") || javadocLower.includes("returns")
                || javadocLower.includes("returning") || javadocLower.includes("return"))) {
                return false;
            }
        }
        var i;
        for (i = 0; i < paramNames; i++) {
            if (!(javadocComment.contains("@param " + paramNames[i]) || javadocComment.contains(paramNames[i].toUpperCase()))) {
                return false;
            }
        }
        return true;
    }

    /**
     * Returns true if the provided class javadoc comment
     * is of correct format according to
     * the style guide and false otherwise.
     * @param {String} classJavadocComment the provided class javadoc comment.
     */
    validateClassJavadocComment(classJavadocComment) {
        return classJavadocComment.includes("@author");
    }

    /**
     * Returns an array of parameter names that are 
     * contained within the method header provided.
     * @param {String} header the method header.
     */
    getParamList(header) {
        var open = header.indexOf('(');
        var close = header.indexOf(')');
        var paramString = header.substring(open + 1, close);
        if (paramString.trim() === "") {
            return [];
        } else {
            var segments = paramString.split(",");
            var names = [];
            var i;
            for (i in segments) {
                var paramSplit = segments[i].split(" ");
                names.push(paramSplit[paramSplit.length - 1]);
            }
            return names;
        }
    }

    /**
     * Returns true if the method header contains a return
     * type other than void and false otherwise.
     * @param {String} header the method header.
     */
    containsReturn(header) {
        return !header.includes("void");
    }
}