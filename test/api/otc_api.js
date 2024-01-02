(function(exports) { 
    const TourCodesURLRoot = 'https://raw.githubusercontent.com/OperationTourCode/OTC/master/';
    const FormatsPathExtension = 'formats/';
    const MashupsPathExtension = 'mashups/';
    const MetadataPathExtension = 'metadata/';
    const TourExt = '.tour';
    exports.TourExt = TourExt;
    const ListSeparator = '\n';
    exports.ListSeparator = ListSeparator;
    const TextExt = '.txt';
    const ListFName = 'list' + TextExt;
    const OfficialsFName = 'officialslist' + TextExt;

    const FormatsURLRoot = TourCodesURLRoot + FormatsPathExtension;

    const MashupsURLRoot = TourCodesURLRoot + MashupsPathExtension;
    const OfficialListURL = MashupsURLRoot + OfficialsFName;

    const GeneralMetadataURLRoot = TourCodesURLRoot + MetadataPathExtension;
    const ListURL = GeneralMetadataURLRoot + ListFName;

    const NotFoundErrorText = '404: Not Found';

    const TourNameLinePrefix = '/tour name ';
    exports.TourNameLinePrefix = TourNameLinePrefix;
    const TourCreateLinePrefix = '/tour create ';
    exports.TourCreateLinePrefix = TourCreateLinePrefix;
    const TourNewLinePrefix = '/tour new ';
    exports.TourNewLinePrefix = TourNewLinePrefix;
    const TourRulesLinePrefix = '/tour rules ';
    exports.TourRulesLinePrefix = TourRulesLinePrefix;
    const TourRulesetLinePrefix = '/tour ruleset ';
    exports.TourRulesetLinePrefix = TourRulesetLinePrefix;
    const InlineNameSeparator = ',,,';
    exports.InlineNameSeparator = InlineNameSeparator;

    const eMashupCategory = {
        'Official':0,
        'All':1,

        'Count':2,

        'Undefined':-1
    };
    Object.freeze(eMashupCategory);
    exports.eMashupCategory = eMashupCategory;

    exports.getMashupCategoryName = function getMashupCategoryName(_eMashupCategory) {
        switch(_eMashupCategory) {
            case eMashupCategory.Official:
                return 'Official Mashups';
            case eMashupCategory.All:
                return 'All Mashups';
        }
        return '';
    }

    const CategoryPathDictionary = {
        0: OfficialListURL,
        1: ListURL,
    };
    exports.CategoryPathDictionary = CategoryPathDictionary;

    exports.createCategoriesDictionary = function createCategoriesDictionary() {
        var dict = {};
        //console.log(JSON.stringify(CategoryPathDictionary));
        for (const key in CategoryPathDictionary) {
            //console.log(key);
            // Check that the property/key is defined in the object itself, not in parent
            if (!CategoryPathDictionary.hasOwnProperty(key)) continue;
            //console.log(key, CategoryPathDictionary[key]);
            dict[key] = {};
            dict[key]["ListURL"] = CategoryPathDictionary[key];
            dict[key]["RootURL"] = FormatsURLRoot;
        }
        return dict;
    }
})(typeof exports === 'undefined'? this['OTC']={}: exports); 