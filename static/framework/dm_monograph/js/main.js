//
// main.js for Diabetes Monograph App
//
// Arjun Sanyal <arjun.sanyal@childrens.harvard.edu>
//
// Note: A good pt with a lot of data: p967332 William Robinson
//
// for tables: http://www.datatables.net/index

// Notes
// for ASA / Aspirin allergies
//
// Salicylic Acids [Chemical/Ingredient]
// http://purl.bioontology.org/ontology/NDFRT/N0000007582
// Aspirin [Chemical/Ingredient]
// http://purl.bioontology.org/ontology/NDFRT/N0000006582
// Salicylates [Chemical/Ingredient]
// http://purl.bioontology.org/ontology/NDFRT/N0000006035
// Acetylsalicylate
// http://purl.bioontology.org/ontology/LNC/LP16020-7
//
// for NSAID allergies
//
// Analgesics, nsaids
// http://purl.bioontology.org/ontology/LNC/LP31430-9
//
// for ACE/ARB
// ACE Inhibitors
// benazepril (Lotensin)
// captopril (Capoten)
// enalapril (Vasotec)
// fosinopril (Monopril)
// lisinopril (Prinivil, Zestril)
// perindopril (Aceon)
// quinapril (Accupril)
// ramipril (Altace)
// trandolapril (Mavik)
//
// Angiotensin II Receptor Blockers (ARBs)
// candesartan (Atacand)
// eprosartan (Tevetan)
// irbesartan (Avapro)
// losartan (Cozaar)
// olmesartan (Benicar)
// telmisartan (Micardis)
// valsartan (Diovan)

// default flot options (bp)
var _flot_opts = {
  xaxis: {
    mode: 'time',
    timeformat: '%y',
    min: new XDate(2009, 11).valueOf(),
    max: new XDate().valueOf(),
    tickSize: [1, 'year'],
    minTickSize: [1, 'year']
  },
  yaxis: {
    min: 50,
    max: 200,
    ticks: [50, 100, 150, 200],
    tickLength: 0
  },
  series: {
    lines: { show: false },
    points: { show: true }
  },
  grid: {
    backgroundColor: '#ebebeb',
    borderWidth: 1,
    markings: [
      { yaxis: { from: 0, to: 80 }, color: "#ccc" },
      { yaxis: { from: 200, to: 130 }, color: "#ccc" }
    ]
  }
}

//
// Patient Object
//
// Plain lab name implies latest result
pt = {};
pt.a1c = null;
pt.a1c_arr = [];
pt.a1c_next = null;
pt.a1c_flot_opts = {};
pt.allergies_arr = [];
pt.bday = null;
pt.bun = null;
pt.bun_arr = [];
pt.bun_next = null;
pt.bun_flot_opts = {};
pt.chol_total = null;
pt.chol_total_arr = [];
pt.chol_total_next = null;
pt.chol_total_flot_opts = {};
pt.creatinine = null;
pt.creatinine_arr = [];
pt.creatinine_next = null;
pt.creatinine_flot_opts = {};
pt.current_sort = '';
pt.dbp = null;
pt.dbp_arr = [];
pt.dbp_next = null;
pt.family_name = null;
pt.flu_shot_date = null;
pt.gender = null;
pt.given_name = null;
pt.glucose = null;
pt.glucose_arr = [];
pt.glucose_next = null;
pt.glucose_flot_opts = {};
pt.hdl = null;
pt.hdl_arr = [];
pt.hdl_next = null;
pt.hdl_flot_opts = {};
pt.height = null;
pt.height_arr = [];
pt.ldl = null;
pt.ldl_arr = [];
pt.ldl_next = null;
pt.ldl_flot_opts = {};
pt.m_alb_cre_ratio = null;
pt.m_alb_cre_ratio_arr = [];
pt.m_alb_cre_ratio_next = null;
pt.m_alb_cre_ratio_flot_opts = {};
pt.meds_arr = [];
pt.pneumovax_date = null;
pt.problems_arr = [];
pt.reminders_arr = [];
pt.sbp = null;
pt.sbp_arr = [];
pt.sbp_next = null;
pt.sgot = null;
pt.sgot_arr = [];
pt.sgot_next = null;
pt.sgot_flot_opts = {};
pt.triglyceride = null;
pt.triglyceride_arr = [];
pt.triglyceride_next = null;
pt.triglyceride_flot_opts = {};
pt.ur_tp = null;
pt.ur_tp_arr = [];
pt.ur_tp_next = null;
pt.ur_tp_flot_opts = {};
pt.weight = null;
pt.weight_arr = [];

//
// Utils
//
var error_cb = function(e){
  alert('error '+e.status+' see console.')
  console.log(e.status);
  console.log(e.message.contentType);
  console.log(e.message.data);
  dfd.reject(e.message);
};

var _round = function(val, dec){
  // console.log(val, dec);
  return Math.round(val*Math.pow(10,dec))/Math.pow(10,dec);
}


//
// Data Queries
//

// pt's with allergies: J Diaz, K Lewis, K Kelly, R Robinson
var ALLERGIES_get = function(){
  return $.Deferred(function(dfd){
    SMART.ALLERGIES_get()
      .success(function(r){
        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .prefix('dc',  'http://purl.org/dc/terms/')
         .where('?id    rdf:type             sp:Allergy')
         .where('?id    sp:drugClassAllergen ?bn')
         .where('?bn    dc:title             ?title')
         .where('?id    sp:allergicReaction  ?bn2')
         .where('?bn2   dc:title             ?reaction')
         .each(function(){
           pt.allergies_arr.push([
             this.title.value.toString(),
             this.reaction.value.toString()
           ])
         })

        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .prefix('dc',  'http://purl.org/dc/terms/')
         .where('?id    rdf:type            sp:Allergy')
         .where('?id    sp:foodAllergen     ?bn')
         .where('?bn    dc:title            ?title')
         .where('?id    sp:allergicReaction ?bn2')
         .where('?bn2   dc:title            ?reaction')
         .each(function(){
           pt.allergies_arr.push([
             this.title.value.toString(),
             this.reaction.value.toString()
           ])
         })
        dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};

var MEDS_get = function(){
  return $.Deferred(function(dfd){
    SMART.MEDS_get()
      .success(function(r){
        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .prefix('dc',  'http://purl.org/dc/terms/')
         .where('?id    rdf:type        sp:Medication')
         .where('?id    sp:startDate    ?date')
         .where('?id    sp:drugName     ?bn')
         .where('?bn    dc:title        ?title')
         .where('?id    sp:instructions ?instruction')
         .each(function(){
           pt.meds_arr.push([
             new XDate(this.date.value).valueOf(),
             this.title.value.toString(),
             this.instruction.value.toString()
           ])
         })
        dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};

var DEMOGRAPHICS_get = function(){
  return $.Deferred(function(dfd){
    SMART.DEMOGRAPHICS_get()
      .success(function(demos){
        var debug = false;
        var jld_data = { '@graph': [] };
        var jld_frame = {
          "@context": {
            "dc": "http://purl.org/dc/terms/",
            "sp": "http://smartplatforms.org/terms#",
            "foaf": "http://xmlns.com/foaf/0.1/",
            "v": "http://www.w3.org/2006/vcard/ns#",
            "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
          },
          "@type": ["sp:Demographics"]
        }
        var jld_out = {};

        demos.graph
          .where('?s ?p ?o')
          .each(function(){
            if (debug) {
             console.log(this.s.dump().value
                       , '('
                       , this.s.dump().type
                       , ')'
                       , this.p.dump().value
                       , '('
                       , this.p.dump().type
                       , ')'
                       , this.o.dump().value
                       , '('
                       , this.o.dump().type
                       , ')'
                       , '\n');
            }

            jstriple = { '@id': this.s.dump().value };
            if (this.o.dump().type === 'literal') {
              jstriple[this.p.dump().value] = [this.o.dump().value]
            }
            else if (this.p.dump().value === 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type') {
              jstriple['@type'] = this.o.dump().value
            }
            else if (this.o.dump().type === 'uri' || 'bnode') {
              jstriple[this.p.dump().value] = [{
                '@id': this.o.dump().value
              }]
            }
            jld_data['@graph'].push(jstriple);
          })

        // if (debug) console.log(JSON.stringify(jld_data));

        // get data from the framed jld output
        jsonld.frame(jld_data['@graph'], jld_frame, {}, function(err, framed) {
          jld_out = framed;
        });

        var o = jld_out['@graph'][0]
        pt.family_name = o['v:n']['v:family-name']
        pt.given_name = o['v:n']['v:given-name']
        pt.gender = o['foaf:gender']
        pt.bday = o['v:bday']

        dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};

var VITAL_SIGNS_get = function(){
  return $.Deferred(function(dfd){
    SMART.VITAL_SIGNS_get()
      .success(function(r){
        var _get_bps = function(type) {
          var code = '';
          var bp_arr = [];
          var bp, bp_next = {};

          if (type === 'systolic') code = '<http://purl.bioontology.org/ontology/LNC/8480-6>';
          else if (type === 'diastolic') code = '<http://purl.bioontology.org/ontology/LNC/8462-4>';
          else alert('error: bp type not systolic or diastolic!');

          r.graph
           .prefix('rdf',      'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
           .prefix('sp',       'http://smartplatforms.org/terms#')
           .prefix('dc',       'http://purl.org/dc/terms/')
           .where('?bn         rdf:type         sp:VitalSign')
           .where('?bn         sp:vitalName     ?vital_name')
           .where('?bn         sp:value         ?value')
           .where('?bn         sp:unit          ?unit')
           .where('?vital_name sp:code          ' + code)
           .where('?bn2        sp:'+ type +'    ?bn')
           .where('?bn2        rdf:type         sp:BloodPressure')
           .where('?vital_id   sp:bloodPressure ?bn2')
           .where('?vital_id   dc:date          ?date')
           .each(function(){
             if (type === 'systolic') {
               bp_arr = pt.sbp_arr;
               bp = pt.sbp;
               bp_next = pt.sbp_next;
             }
             else {
               bp_arr = pt.dbp_arr;
               bp = pt.dbp;
               bp_next = pt.dbp_next;
             }

             bp_arr.push([
               new XDate(this.date.value).valueOf(),
               Number(this.value.value),
               this.unit.value
             ])
           })

           bp_arr = _(bp_arr).sortBy(function(item){ return item[0]; })
           bp = _(bp_arr).last() || null
           bp_next = _(bp_arr).last(2)[0] || null
        }

        _get_bps('systolic');
        _get_bps('diastolic')

        r.graph
         .prefix('rdf',      'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',       'http://smartplatforms.org/terms#')
         .prefix('dc',       'http://purl.org/dc/terms/')
         .where('?vital_id   sp:weight        ?bn')
         .where('?vital_id   dc:date          ?date')
         .where('?bn         sp:vitalName     ?bn2')
         .where('?bn2        sp:code          <http://purl.bioontology.org/ontology/LNC/3141-9>')
         .where('?bn         rdf:type         sp:VitalSign')
         .where('?bn         sp:value         ?value')
         .where('?bn         sp:unit          ?unit')
         .each(function(){
           pt.weight_arr.push([
             new XDate(this.date.value).valueOf(),
             Number(this.value.value),
             this.unit.value
           ])
         })

        pt.weight_arr = _(pt.weight_arr).sortBy(function(item){ return item[0]; })
        pt.weight = _(pt.weight_arr).last() || null

        r.graph
         .prefix('rdf',      'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',       'http://smartplatforms.org/terms#')
         .prefix('dc',       'http://purl.org/dc/terms/')
         .where('?vital_id   sp:height        ?bn')
         .where('?vital_id   dc:date          ?date')
         .where('?bn         sp:vitalName     ?bn2')
         .where('?bn2        sp:code          <http://purl.bioontology.org/ontology/LNC/8302-2>')
         .where('?bn         rdf:type         sp:VitalSign')
         .where('?bn         sp:value         ?value')
         .where('?bn         sp:unit          ?unit')
         .each(function(){
           pt.height_arr.push([
             new XDate(this.date.value).valueOf(),
             Number(this.value.value),
             this.unit.value
           ])
         })

        pt.height_arr = _(pt.height_arr).sortBy(function(item){ return item[0]; })
        pt.height = _(pt.height_arr).last() || null

        dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};

var LAB_RESULTS_get = function(){
  return $.Deferred(function(dfd){
    SMART.LAB_RESULTS_get()
      .success(function(r){
        // LDL Codes
        //
        // LOINC Code, Long name, Short Name, class, rank # of 2000
        // 13457-7	Cholesterol in LDL [Mass/volume] in Serum or Plasma by calculation	LDLc SerPl Calc-mCnc	CHEM	63
        // 2089-1	Cholesterol in LDL [Mass/volume] in Serum or Plasma	LDLc SerPl-mCnc	CHEM	92
        // 18262-6	Cholesterol in LDL [Mass/volume] in Serum or Plasma by Direct assay	LDLc SerPl Direct Assay-mCnc	CHEM	249
        // FIXME: ONLY top LDL code!!
        r.graph
         .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',  'http://smartplatforms.org/terms#')
         .where('?lr    rdf:type              sp:LabResult')
         .where('?lr    sp:labName            ?bn1')
         .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/13457-7>')
         .where('?lr    sp:quantitativeResult ?bn2')
         .where('?bn2   rdf:type              sp:QuantitativeResult')
         .where('?bn2   sp:valueAndUnit       ?bn3')
         .where('?bn3   rdf:type              sp:ValueAndUnit')
         .where('?bn3   sp:value              ?value')
         .where('?bn3   sp:unit               ?unit')
         .where('?lr    sp:specimenCollected  ?bn4')
         .where('?bn4   sp:startDate          ?date')
         .each(function(){
           // FIXME: hack push all dates + 3 years
           var d = new XDate(this.date.value)
           d.addYears(3, true);

           // array is [js timestamp, value as number, unit as string]
           // flot uses js timestamps on the x axis, we convert them to human-readable strings later
           pt.ldl_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
           ])
         })

         pt.ldl_arr = _(pt.ldl_arr).sortBy(function(item){ return item[0]; })
         pt.ldl = _(pt.ldl_arr).last() || null
         pt.ldl_next = _(pt.ldl_arr).last(2)[0] || null
         $.extend(true,
           pt.ldl_flot_opts,
           _flot_opts,
           {
             yaxis: {
               min: 0,
               max: 200,
               ticks: [0, 50, 100, 150, 200],
               tickLength: 0
             },
             grid: {
               backgroundColor: '#ebebeb',
               borderWidth: 1,
               markings: [ { yaxis: { from: 200, to: 100 }, color: "#ccc" } ]
             }
           }
         );

         // A1C Codes
         //
         // LOINC Code, Long name, Short Name, class, rank # of 2000
         // 4548-4,Hemoglobin A1c/Hemoglobin.total in Blood,Hgb A1c MFr Bld,HEM/BC,81
         // 17856-6,Hemoglobin A1c/Hemoglobin.total in Blood by HPLC,Hgb A1c MFr Bld HPLC,HEM/BC,215
         // FIXME: ONLY top A1c code!!
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/4548-4>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){

            // fixme: hack pushing date 2 yrs
            var d = new XDate(this.date.value)
            d.addYears(2, true);

            pt.a1c_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.a1c_arr = _(pt.a1c_arr).sortBy(function(item){ return item[0]; })
          pt.a1c = _(pt.a1c_arr).last() || null
          pt.a1c_next = _(pt.a1c_arr).last(2)[0] || null
          $.extend(true,
            pt.a1c_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 20,
                ticks: [0, 5, 10, 15, 20],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [ { yaxis: { from: 20, to: 7 }, color: "#ccc" } ]
              }
            }
          );

          // Ur Tp
          //
          // 5804-0,Protein [Mass/volume] in Urine by Test strip,Prot Ur Strip-mCnc,UA,74
          // 2888-6,Protein [Mass/volume] in Urine,Prot Ur-mCnc,UA,292
          // 35663-4,Protein [Mass/volume] in unspecified time Urine,Prot ?Tm Ur-mCnc,UA,635
          // 21482-5,Protein [Mass/volume] in 24 hour Urine,Prot 24H Ur-mCnc,CHEM,1696
          // FIXME: ONLY top code!!
          r.graph
           .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
           .prefix('sp',  'http://smartplatforms.org/terms#')
           .where('?lr    rdf:type              sp:LabResult')
           .where('?lr    sp:labName            ?bn1')
           .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/5804-0>')
           .where('?lr    sp:quantitativeResult ?bn2')
           .where('?bn2   rdf:type              sp:QuantitativeResult')
           .where('?bn2   sp:valueAndUnit       ?bn3')
           .where('?bn3   rdf:type              sp:ValueAndUnit')
           .where('?bn3   sp:value              ?value')
           .where('?bn3   sp:unit               ?unit')
           .where('?lr    sp:specimenCollected  ?bn4')
           .where('?bn4   sp:startDate          ?date')
           .each(function(){
             pt.ur_tp_arr.push([
                new XDate(this.date.value).valueOf(),
                Number(this.value.value),
                this.unit.value
             ])
           })

           pt.ur_tp_arr = _(pt.ur_tp_arr).sortBy(function(item){ return item[0]; })
           pt.ur_tp = _(pt.ur_tp_arr).last() || null
           pt.ur_tp_next = _(pt.ur_tp_arr).last(2)[0] || null
           $.extend(true,
             pt.ur_tp_flot_opts,
             _flot_opts,
             {
               yaxis: {
                 min: 0,
                 max: 200,
                 ticks: [0, 50, 100, 150, 200],
                 tickLength: 0
               },
               grid: {
                 backgroundColor: '#ebebeb',
                 borderWidth: 1,
                 markings: [ { yaxis: { from: 200, to: 135 }, color: "#ccc" } ]
               }
             }
           );

         // Microalbumin/Creatinine [Mass ratio] in Urine
         //
         // 14959-1,Microalbumin/Creatinine [Mass ratio] in Urine,Microalbumin/Creat Ur-mRto,CHEM,212
         // 14958-3,Microalbumin/Creatinine [Mass ratio] in 24 hour Urine,Microalbumin/Creat 24H Ur-mRto,CHEM,1979
         // FIXME: ONLY top code!!
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/14959-1>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.m_alb_cre_ratio_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.m_alb_cre_ratio_arr = _(pt.m_alb_cre_ratio_arr).sortBy(function(item){ return item[0]; })
          pt.m_alb_cre_ratio = _(pt.m_alb_cre_ratio_arr).last() || null
          pt.m_alb_cre_ratio_next = _(pt.m_alb_cre_ratio_arr).last(2)[0] || null
          $.extend(true,
            pt.m_alb_cre_ratio_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 50,
                ticks: [0, 10, 20, 30, 40, 50],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [ { yaxis: { from: 50, to: 30 }, color: "#ccc" } ]
              }
            }
          );

         // Aspartate aminotransferase / SGOT / AST
         //
         // only 1 code!! #20!!
         //
         // LOINC Code, Long name, Short Name, class, rank # of 2000
         // 1920-8,Aspartate aminotransferase [Enzymatic activity/volume] in Serum or Plasma,AST SerPl-cCnc,CHEM,19
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/1920-8>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.sgot_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.sgot_arr = _(pt.sgot_arr).sortBy(function(item){ return item[0]; })
          pt.sgot = _(pt.sgot_arr).last() || null
          pt.sgot_next = _(pt.sgot_arr).last(2)[0] || null
          $.extend(true,
            pt.sgot_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 50,
                ticks: [0, 10, 20, 30, 40, 50],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [
                  { yaxis: { from: 10, to: 10 }, color: "#ccc" },
                  { yaxis: { from: 40, to: 40 }, color: "#ccc" }
                ]
              }
            }
          );

         // Cholesterol (total): only 1 code!! Yay!
         //
         // 2093-3,Cholesterol [Mass/volume] in Serum or Plasma,Cholest SerPl-mCnc,CHEM,32
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2093-3>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.chol_total_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.chol_total_arr = _(pt.chol_total_arr).sortBy(function(item){ return item[0]; })
          pt.chol_total = _(pt.chol_total_arr).last() || null
          pt.chol_total_next = _(pt.chol_total_arr).last(2)[0] || null
          $.extend(true,
            pt.chol_total_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 300,
                ticks: [0, 50, 100, 150, 200, 250, 300],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [ { yaxis: { from: 300, to: 200 }, color: "#ccc" } ]
              }
            }
          );

         // Tri
         //
         // 2571-8,Triglyceride [Mass/volume] in Serum or Plasma,Trigl SerPl-mCnc,CHEM,36
         // 3043-7,Triglyceride [Mass/volume] in Blood,Trigl Bld-mCnc,CHEM,1592
         // fixme only 1 code!
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2571-8>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.triglyceride_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.triglyceride_arr = _(pt.triglyceride_arr).sortBy(function(item){ return item[0]; })
          pt.triglyceride = _(pt.triglyceride_arr).last() || null
          pt.triglyceride_next = _(pt.triglyceride_arr).last(2)[0] || null
          $.extend(true,
            pt.triglyceride_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 250,
                ticks: [0, 50, 100, 150, 250],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [ { yaxis: { from: 250, to: 150 }, color: "#ccc" } ]
              }
            }
          );

         // HDL
         // 2085-9,Cholesterol in HDL [Mass/volume] in Serum or Plasma,HDLc SerPl-mCnc,CHEM,38
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2085-9>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.hdl_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.hdl_arr = _(pt.hdl_arr).sortBy(function(item){ return item[0]; })
          pt.hdl = _(pt.hdl_arr).last() || null
          pt.hdl_next = _(pt.hdl_arr).last(2)[0] || null
          $.extend(true,
            pt.hdl_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 150,
                ticks: [0, 50, 100, 150],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [ { yaxis: { from: 150, to: 40 }, color: "#ccc" } ]
              }
            }
          );

         // BUN
         //
         // 3094-0,Urea nitrogen [Mass/volume] in Serum or Plasma,BUN SerPl-mCnc,CHEM,6
         // 6299-2,Urea nitrogen [Mass/volume] in Blood,BUN Bld-mCnc,CHEM,288
         // fixme only top code
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/4548-4>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.bun_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.bun_arr = _(pt.bun_arr).sortBy(function(item){ return item[0]; })
          pt.bun = _(pt.bun_arr).last() || null
          pt.bun_next = _(pt.bun_arr).last(2)[0] || null
          $.extend(true,
            pt.bun_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 35,
                ticks: [0, 5, 10, 15, 20, 25, 30, 35],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [
                  { yaxis: { from: 0, to: 8 }, color: "#ccc" },
                  { yaxis: { from: 35, to: 25 }, color: "#ccc" }
                ]
              }
            }
          );

         // Cre
         //
         // 2160-0,Creatinine [Mass/volume] in Serum or Plasma,Creat SerPl-mCnc,CHEM,1
         // 38483-4,Creatinine [Mass/volume] in Blood,Creat Bld-mCnc,CHEM,283
         // fixme only top code
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2160-0>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.creatinine_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.creatinine_arr = _(pt.creatinine_arr).sortBy(function(item){ return item[0]; })
          pt.creatinine = _(pt.creatinine_arr).last() || null
          pt.creatinine_next = _(pt.creatinine_arr).last(2)[0] || null
          $.extend(true,
            pt.creatinine_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 2,
                ticks: [0, 0.5, 1, 1.5, 2],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [
                  { yaxis: { from: 0, to: 0.6 }, color: "#ccc" },
                  { yaxis: { from: 2, to: 1.5 }, color: "#ccc" }
                ]
              }
            }
          );

         // Glu
         // 2345-7,Glucose [Mass/volume] in Serum or Plasma,Glucose SerPl-mCnc,CHEM,4
         // 2339-0,Glucose [Mass/volume] in Blood,Glucose Bld-mCnc,CHEM,13
         // fixme only top code
         r.graph
          .prefix('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
          .prefix('sp',  'http://smartplatforms.org/terms#')
          .where('?lr    rdf:type              sp:LabResult')
          .where('?lr    sp:labName            ?bn1')
          .where('?bn1   sp:code               <http://purl.bioontology.org/ontology/LNC/2345-7>')
          .where('?lr    sp:quantitativeResult ?bn2')
          .where('?bn2   rdf:type              sp:QuantitativeResult')
          .where('?bn2   sp:valueAndUnit       ?bn3')
          .where('?bn3   rdf:type              sp:ValueAndUnit')
          .where('?bn3   sp:value              ?value')
          .where('?bn3   sp:unit               ?unit')
          .where('?lr    sp:specimenCollected  ?bn4')
          .where('?bn4   sp:startDate          ?date')
          .each(function(){
            // FIXME: hack push all dates + 3 years
            var d = new XDate(this.date.value)
            d.addYears(3, true);

            pt.glucose_arr.push([
              d.valueOf(),
              Number(this.value.value),
              this.unit.value
            ])
          })

          pt.glucose_arr = _(pt.glucose_arr).sortBy(function(item){ return item[0]; })
          pt.glucose = _(pt.glucose_arr).last() || null
          pt.glucose_next = _(pt.glucose_arr).last(2)[0] || null
          $.extend(true,
            pt.glucose_flot_opts,
            _flot_opts,
            {
              yaxis: {
                min: 0,
                max: 150,
                ticks: [0, 25, 50, 100, 125, 150],
                tickLength: 0
              },
              grid: {
                backgroundColor: '#ebebeb',
                borderWidth: 1,
                markings: [
                  { yaxis: { from: 0, to: 70 }, color: "#ccc" },
                  { yaxis: { from: 110, to: 150 }, color: "#ccc" }
                ]
              }
            }
          );

          //
          // Reminders
          //
          var reminder_data = [
          {
            'title_html':             'glycemia',
            'reminder_html':          'Consider checking A1C today',
            'lab_variable':           pt.a1c,
            'lab_name_html':          'A1C',
            'target_min':             0,
            'target_max':             7,
            'target_unit':            '%',
            'target_range_text_html': 'less than 7%',
            'overdue_in_months':      6,
            'extra_info_html':        null
          },
          {
            'title_html':             'lipids',
            'reminder_html':          'Consider checking lipids today',
            'lab_variable':           pt.ldl,
            'lab_name_html':          'LDL',
            'target_min':             0,
            'target_max':             100,
            'target_unit':            'mg/dl',
            'target_range_text_html': 'less than 100mg/dl',
            'overdue_in_months':      6,
            'extra_info_html':        'Consider more aggressive target of &lt; 70 (established CAD).'
          },
          {
            'title_html':             'albuminuria',
            'reminder_html':          'Consider checking urine &micro;alb/cre ratio today',
            'lab_variable':           pt.m_alb_cre_ratio,
            'lab_name_html':          'urine &alb/cre ratio',
            'target_min':             0,
            'target_max':             30,
            'target_unit':            'mg/g',
            'target_range_text_html': 'less than 30', // FIXME: we don't really know this
            'overdue_in_months':      6, // FIXME: we don't really know this
            'extra_info_html':        '&micro;alb/cre ratio test preferred over non-ratio &micro;alp screening tests.'
          }]

          var process_reminders = function(reminder_data){
            _(reminder_data).each(function(r){
              if (r.lab_variable) {
                // is the latest date within the given range?
                var today = new XDate();
                var d = new XDate(r.lab_variable[0])
                r.overdue_p = false;
                r.months_ago = Math.round(d.diffMonths(today));
                if (r.months_ago > r.overdue_in_months) { r.overdue_p = true; }

                // is the latest value within the given range?
                r.in_range_p = false;
                if (r.target_min < r.lab_variable[1] &&
                    r.lab_variable[1] < r.target_max) {
                  r.in_range_p = true;
                }

                pt.reminders_arr.push(r);
              } else {
                return;
              }
            })
          }

          process_reminders(reminder_data);

         // resolved!
         dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};


var PROBLEMS_get = function(){
  return $.Deferred(function(dfd){
    SMART.PROBLEMS_get()
      .success(function(r){
        r.graph
         .prefix('rdf',  'http://www.w3.org/1999/02/22-rdf-syntax-ns#')
         .prefix('sp',   'http://smartplatforms.org/terms#')
         .prefix('dc',   'http://purl.org/dc/terms/')
         .where('?id     rdf:type       sp:Problem')
         .where('?id     sp:startDate   ?date')
         .where('?id     sp:problemName ?bn')
         .where('?bn     rdf:type       sp:CodedValue')
         .where('?bn     dc:title       ?title')
         .optional('?id  sp:endDate     ?end_date')
         .each(function(){
           pt.problems_arr.push([
             new XDate(this.date.value).valueOf(),
             this.title.value,
             this.end_date ? new XDate(this.end_date.value).valueOf() : null
           ])
         })

        pt.problems_arr = _(pt.problems_arr).sortBy(function(item){ return item[0]; })
        dfd.resolve();
      })
      .error(error_cb);
  }).promise();
};

// On SMART.ready, do all the data api calls and synchronize
// when they are all complete.
SMART.ready(function(){
  $.when(
         ALLERGIES_get()
       , DEMOGRAPHICS_get()
       , VITAL_SIGNS_get()
       , LAB_RESULTS_get()
       , PROBLEMS_get()
       , MEDS_get()
  )
  .then(function(){

    $('#family_name').text(pt.family_name)
    $('#given_name').text(pt.given_name)
    $('#record_id').text(SMART.record.id)
    $('#birthday').text(pt.bday)
    var b = new XDate(pt.bday)
    $('#age').text(Math.round(b.diffYears(new XDate())));
    $('#gender').text(pt.gender[0])


    // insert data into html
    // last known values (all arrays sorted by ascending dates)
    // FIXME: DRY
    $('#ur_tp_date').text(pt.ur_tp ? new XDate(pt.ur_tp[0]).toString('MM/dd/yy') : '-')
    $('#ur_tp_val') .text(pt.ur_tp ? pt.ur_tp[1] : null)
    $('#ur_tp_unit').text(pt.ur_tp ? pt.ur_tp[2] : null)

    $('#ur_tp_next_date').text(pt.ur_tp_next ? new XDate(pt.ur_tp_next[0]).toString('MM/dd/yy') : '-')
    $('#ur_tp_next_val') .text(pt.ur_tp_next ? pt.ur_tp_next[1] : null)
    $('#ur_tp_next_unit').text(pt.ur_tp_next ? pt.ur_tp_next[2] : null)

    $('#m_alb_cre_ratio_date').text(pt.m_alb_cre_ratio ? new XDate(pt.m_alb_cre_ratio[0]).toString('MM/dd/yy') : '-')
    $('#m_alb_cre_ratio_val') .text(pt.m_alb_cre_ratio ? pt.m_alb_cre_ratio[1] : null)
    $('#m_alb_cre_ratio_unit').text(pt.m_alb_cre_ratio ? pt.m_alb_cre_ratio[2] : null)

    $('#m_alb_cre_ratio_next_date').text(pt.m_alb_cre_ratio_next ? new XDate(pt.m_alb_cre_ratio_next[0]).toString('MM/dd/yy') : '-')
    $('#m_alb_cre_ratio_next_val') .text(pt.m_alb_cre_ratio_next ? pt.m_alb_cre_ratio_next[1] : null)
    $('#m_alb_cre_ratio_next_unit').text(pt.m_alb_cre_ratio_next ? pt.m_alb_cre_ratio_next[2] : null)

    $('#sgot_date').text(pt.sgot ? new XDate(pt.sgot[0]).toString('MM/dd/yy') : '-')
    $('#sgot_val') .text(pt.sgot ? pt.sgot[1] : null)
    $('#sgot_unit').text(pt.sgot ? pt.sgot[2] : null)

    $('#sgot_next_date').text(pt.sgot_next ? new XDate(pt.sgot_next[0]).toString('MM/dd/yy') : '-')
    $('#sgot_next_val') .text(pt.sgot_next ? pt.sgot_next[1] : null)
    $('#sgot_next_unit').text(pt.sgot_next ? pt.sgot_next[2] : null)

    $('#chol_total_date').text(pt.chol_total ? new XDate(pt.chol_total[0]).toString('MM/dd/yy') : '-')
    $('#chol_total_val') .text(pt.chol_total ? pt.chol_total[1] : null)
    $('#chol_total_unit').text(pt.chol_total ? pt.chol_total[2] : null)

    $('#chol_total_next_date').text(pt.chol_total_next ? new XDate(pt.chol_total_next[0]).toString('MM/dd/yy') : '-')
    $('#chol_total_next_val') .text(pt.chol_total_next ? pt.chol_total_next[1] : null)
    $('#chol_total_next_unit').text(pt.chol_total_next ? pt.chol_total_next[2] : null)

    $('#triglyceride_date').text(pt.triglyceride ? new XDate(pt.triglyceride[0]).toString('MM/dd/yy') : '-')
    $('#triglyceride_val') .text(pt.triglyceride ? pt.triglyceride[1] : null)
    $('#triglyceride_unit').text(pt.triglyceride ? pt.triglyceride[2] : null)

    $('#triglyceride_next_date').text(pt.triglyceride_next ? new XDate(pt.triglyceride_next[0]).toString('MM/dd/yy') : '-')
    $('#triglyceride_next_val') .text(pt.triglyceride_next ? pt.triglyceride_next[1] : null)
    $('#triglyceride_next_unit').text(pt.triglyceride_next ? pt.triglyceride_next[2] : null)

    $('#hdl_date').text(pt.hdl ? new XDate(pt.hdl[0]).toString('MM/dd/yy') : '-')
    $('#hdl_val') .text(pt.hdl ? pt.hdl[1] : null)
    $('#hdl_unit').text(pt.hdl ? pt.hdl[2] : null)

    $('#hdl_next_date').text(pt.hdl_next ? new XDate(pt.hdl_next[0]).toString('MM/dd/yy') : '-')
    $('#hdl_next_val') .text(pt.hdl_next ? pt.hdl_next[1] : null)
    $('#hdl_next_unit').text(pt.hdl_next ? pt.hdl_next[2] : null)

    $('#ldl_date').text(pt.ldl ? new XDate(pt.ldl[0]).toString('MM/dd/yy') : '-')
    $('#ldl_val') .text(pt.ldl ? pt.ldl[1] : null)
    $('#ldl_unit').text(pt.ldl ? pt.ldl[2] : null)

    $('#ldl_next_date').text(pt.ldl_next ? new XDate(pt.ldl_next[0]).toString('MM/dd/yy') : '-')
    $('#ldl_next_val') .text(pt.ldl_next ? pt.ldl_next[1] : null)
    $('#ldl_next_unit').text(pt.ldl_next ? pt.ldl_next[2] : null)

    $('#bun_date').text(pt.bun ? new XDate(pt.bun[0]).toString('MM/dd/yy') : '-')
    $('#bun_val') .text(pt.bun ? pt.bun[1] : null)
    $('#bun_unit').text(pt.bun ? pt.bun[2] : null)

    $('#bun_next_date').text(pt.bun_next ? new XDate(pt.bun_next[0]).toString('MM/dd/yy') : '-')
    $('#bun_next_val') .text(pt.bun_next ? pt.bun_next[1] : null)
    $('#bun_next_unit').text(pt.bun_next ? pt.bun_next[2] : null)

    $('#creatinine_date').text(pt.creatinine ? new XDate(pt.creatinine[0]).toString('MM/dd/yy') : '-')
    $('#creatinine_val') .text(pt.creatinine ? pt.creatinine[1] : null)
    $('#creatinine_unit').text(pt.creatinine ? pt.creatinine[2] : null)

    $('#creatinine_next_date').text(pt.creatinine_next ? new XDate(pt.creatinine_next[0]).toString('MM/dd/yy') : '-')
    $('#creatinine_next_val') .text(pt.creatinine_next ? pt.creatinine_next[1] : null)
    $('#creatinine_next_unit').text(pt.creatinine_next ? pt.creatinine_next[2] : null)

    $('#glucose_date').text(pt.glucose ? new XDate(pt.glucose[0]).toString('MM/dd/yy') : '-')
    $('#glucose_val') .text(pt.glucose ? pt.glucose[1] : null)
    $('#glucose_unit').text(pt.glucose ? pt.glucose[2] : null)

    $('#glucose_next_date').text(pt.glucose_next ? new XDate(pt.glucose_next[0]).toString('MM/dd/yy') : '-')
    $('#glucose_next_val') .text(pt.glucose_next ? pt.glucose_next[1] : null)
    $('#glucose_next_unit').text(pt.glucose_next ? pt.glucose_next[2] : null)

    $('#a1c_date').text(pt.a1c ? new XDate(pt.a1c[0]).toString('MM/dd/yy') : '-')
    $('#a1c_val') .text(pt.a1c ? pt.a1c[1] : null)
    $('#a1c_unit').text(pt.a1c ? pt.a1c[2] : null)

    $('#a1c_next_date').text(pt.a1c_next ? new XDate(pt.a1c_next[0]).toString('MM/dd/yy') : '-')
    $('#a1c_next_val') .text(pt.a1c_next ? pt.a1c_next[1] : null)
    $('#a1c_next_unit').text(pt.a1c_next ? pt.a1c_next[2] : null)

    // other info
    $('#weight_date').text(pt.weight ? new XDate(pt.weight[0]).toString('MM/dd/yy') : null)

    var weight_val_lb = pt.weight[2] === 'kg' ? pt.weight[1] * 2.2 : null
    weight_val_lb = weight_val_lb < 22 ? _round(weight_val_lb, 1) : _round(weight_val_lb, 0)
    var weight_val_kg = pt.weight[1] || null
    weight_val_kg = weight_val_kg < 10 ? _round(weight_val_kg, 1) : _round(weight_val_kg, 0)
    $('#weight_val_lb').text(weight_val_lb || 'Unk')
    $('#weight_val_kg').text(weight_val_kg || 'Unk')

    var height_val_in = pt.height[2] === 'm' ? _round(pt.height[1]  / .0254, 0) : null
    var height_val_cm = _round(pt.height[1] * 100, 0) || null

    $('#height_date').text(pt.height ? new XDate(pt.height[0]).toString('MM/dd/yy') : null)
    $('#height_val_in').text(height_val_in || 'Unk')
    $('#height_val_cm').text(height_val_cm || 'Unk')

    // Fixme: NO pneumovax or flu codes in the current pts...
    if (!pt.pneumovax_date) { $('#pneumovax_date').text('-'); }
    if (!pt.flu_shot_date) { $('#flu_shot_date').text('-'); }

    if (pt.problems_arr.length == 0) { $('<div></div>', {text: 'No known problems'}).appendTo('#problems'); }

    var do_stripes = function(){
      $('.cv_comorbidity, .allergy, .problem, .medication, .reminder').each(function(i,e){ $(e).css({'background-color': ''}); })
      $('.cv_comorbidity').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.allergy').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.problem').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.medication').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
      $('.reminder').filter(':odd').each(function(i,e){ $(e).css({'background-color': '#ebebeb'}); })
    }

    // (some) cv comorbidities
    // fixme: I'm sure there are many more...
    // http://www.ncbi.nlm.nih.gov/pmc/articles/PMC550650/
    var generate_comorbidities = function(){
      $('#cv_comorbidities').empty();

      var cv_comorbidities = _($('.problem'))
        .chain()
        .filter(function(e) {
          var title = $(e).text();
          if (title.match(/heart disease/i)) return true;
          if (title.match(/Congestive Heart Failure/i)) return true;
          if (title.match(/Myocardial Infarction/i)) return true;
          if (title.match(/Cerebrovascular Disease /i)) return true;
          if (title.match(/Hypertension/i)) return true;
          if (title.match(/neuropathic pain/i)) return true;
          if (title.match(/coronary arteriosclerosis/i)) return true;
          if (title.match(/chronic renal impariment/i)) return true;
          if (title.match(/cardiac bypass graft surgery/i)) return true;
          if (title.match(/Preinfarction syndrome/i)) return true;
          if (title.match(/Chest pain/i)) return true;
          if (title.match(/Chronic ischemic heart disease/i)) return true;
          if (title.match(/Disorder of cardiovascular system/i)) return true;
          if (title.match(/Precordial pain/i)) return true;
          return false;
        })
        .map(function(e){
          return $(e).clone();
        })
        .value()

      if (cv_comorbidities.length == 0) { $('<div></div>', {text: 'No known CV comorbidities'}).appendTo('#cv_comorbidities'); }
      _(cv_comorbidities).each(function(e){
        e.removeClass('problem').addClass('cv_comorbidity').appendTo('#cv_comorbidities')
      })

    }


    var sort_by_alpha = function(){
      // de-bounce
      if (pt.current_sort == 'alpha') return;
      pt.current_sort = 'alpha';

      // do two counts: (number current (no enddate), number resolved (has enddate))
      // note: e[2] is endDate or null, e[3] count of resolved, e[4] count of active
      $('#problems').empty()

      _(pt.problems_arr)
        .chain()
        .sortBy(function(e){ return e[1]; })
        .map(function(e){
            // count resolved
            var f = _(pt.problems_arr).filter(function(e2){ return (e[1] === e2[1] && e2[2] != null); })
            e[3] = f.length;
            return e;
        })
        .map(function(e){
            // count active
            var f = _(pt.problems_arr).filter(function(e2){ return (e[1] === e2[1] && e2[2] == null); })
            e[4] = f.length;
            return e;
        })
        .uniq(true, function(e){ return e[1]; })
        .each(function(e){
          var resolved_n = e[3];
          var active_n = e[4];
          var c = 'active';
          if (resolved_n && !active_n) { c = 'resolved'; }
          var text = e[1];

          // don't show unnecessary 1's
          if (resolved_n + active_n > 1) {
            text = text + ' <span class="smaller grayer"> (';
            if (active_n > 0) { text = text + active_n; }
            if (active_n > 0 && resolved_n) { text = text + ', '; }
            if (resolved_n) { text = text + '<span class="resolved">'+resolved_n+'</span>'; }
            text = text + ')</span>';
          }

          $('<div></div>'
           , { 'class': c
             , 'html': text
             }
           )
            .addClass('problem')
            .data(e)
            .appendTo('#problems')
        })
        .value()

      $('.problem:contains("Diabetes")').css('color', 'red');

      generate_comorbidities();

      // medications
      $('#medications').empty()
      if (pt.meds_arr.length == 0) { $('<div/>', {text: 'No known medications'}).appendTo('#medications'); }
      _(pt.meds_arr).chain()
        .sortBy(function(e){ return e[1].toLowerCase(); })
        .each(function(e){
          var a = e[1].split(' ')
          $('<div></div>', {
            'class': 'medication',
            html: '<span class=\'bold\'>' + a[0] + '</span> ' + _(a).rest().join(' ') + ' ' + e[2]
          })
          .data(e)
          .appendTo('#medications')
        })
        .value()
        do_stripes()
    };
    
    // allergies
    if (pt.allergies_arr.length == 0) { $('<div/>', {text: 'No known allergies'}).appendTo('#allergies'); }
    _(pt.allergies_arr).each(function(e){
      $('<div></div>', {
        'class': 'allergy',
        html: '<span class=\'bold\'>' + e[0] + '</span> ' + e[1]
      })
      .data(e)
      .appendTo('#allergies')
    })

    //
    // display by date
    //

    var sort_by_date = function(){
      // de-bounce
      if (pt.current_sort === 'date') return;
      pt.current_sort = 'date';

      // problems
      // prepend date to all problems (or get attached data)
      var p2 =_($('.problem')).chain()
        .map(function(e){
          e = $(e)
          var date = e.data('0') ? new XDate(e.data('0')).toString('MM/dd/yy') : '';
          var h = '<span class="date">'+date+'</span>';
          return e.html(h+' '+e.html())
        })
        .sortBy(function(e){ return $(e).data('0'); })
        .reverse()
        .value()

      $('#problems').empty();
      _(p2).each(function(e){ $(e).appendTo('#problems'); })
      $('.problem:contains("Diabetes")').css('color', 'red');

      // re-generate co-morbs
      generate_comorbidities();

      // do meds
      var m2 =_($('.medication')).chain()
        .map(function(e){
          e = $(e)
          var date = e.data('0') ? new XDate(e.data('0')).toString('MM/dd/yy') : '';
          var h = '<span class="date">'+date+'</span>';
          return e.html(h+' '+e.html())
        })
        .sortBy(function(e){ return $(e).data('0'); })
        .reverse()
        .value()

      $('#medications').empty();
      _(m2).each(function(e){ $(e).appendTo('#medications'); })
      do_stripes();
    };

    
    //
    // reminders
    //
    if (pt.reminders_arr.length == 0) { $('<div/>', {text: 'No current reminders'}).appendTo('#reminders'); }
    _(pt.reminders_arr).each(function(e){
      // todo: use templating here
      var html = '<span class=\'bold\'>' + e.title_html + '</span> ';
      if (e.overdue_p) {
        html = html + '<span class=\'red\'>'  + e.reminder_html + '</span> <br />';
      }

      var d = new XDate(e.lab_variable[0])
      html = html + 'Last ' + e.lab_name_html +
        ' ('+ e.lab_variable[1] + e.lab_variable[2] + ') ' +
        ' done on ' + d.toString('MM/dd/yy') + ' (' + e.months_ago + ' months ago)' ;

      if (e.in_range_p) {
        html = html + ' within target range (' + e.target_range_text_html + ')'
      } else {
        html = html + ' <span class=\'bold\'>out of target range</span> (' + e.target_range_text_html + ')'
      }

      $('<div></div>', {
        class: 'reminder',
        html: html
      }).appendTo('#reminders')
    })

    sort_by_alpha();

    var draw_plots = function(callback){
      // set the heights for the graphs and set the (fluid) width
      // of the a1c graph to be the same as the other graphs
      var h = 100;
      $('#bp_graph') .height(h);
      $('#ldl_graph').height(h);
      $('#a1c_graph').height(h).width('100%')

      // fixme: hack to boost pediatric bps to adult bps if ago over 10y
      var b = new XDate(pt.bday)
      var age = Math.round(b.diffYears(new XDate()));

      if (age > 10) {
        pt.dbp_arr = _(pt.dbp_arr).map(function(e){
          e[1] = e[1] + 30;
          return e;
        })
        pt.sbp_arr = _(pt.sbp_arr).map(function(e){
          e[1] = e[1] + 30;
          return e;
        })
      }

      // plot'em!
      $.plot($("#bp_graph"),  [pt.dbp_arr, pt.sbp_arr], _flot_opts);
      $.plot($("#ldl_graph"), [pt.ldl_arr],             pt.ldl_flot_opts);
      $.plot($("#a1c_graph"), [pt.a1c_arr],             pt.a1c_flot_opts);

      // fixme: dry
      $.plot($("#bp_graph_lkv"),  [pt.dbp_arr, pt.sbp_arr], _flot_opts);
      $.plot($("#ldl_graph_lkv"), [pt.ldl_arr],             pt.ldl_flot_opts);
      $.plot($("#a1c_graph_lkv"), [pt.a1c_arr],             pt.a1c_flot_opts);

      $.plot($("#ur_tp_graph"),           [pt.ur_tp_arr],           pt.ur_tp_flot_opts);
      $.plot($("#m_alb_cre_ratio_graph"), [pt.m_alb_cre_ratio_arr], pt.m_alb_cre_ratio_flot_opts);
      $.plot($("#sgot_graph"),            [pt.sgot_arr],            pt.sgot_flot_opts);
      $.plot($("#chol_total_graph"),      [pt.chol_total_arr],      pt.chol_total_flot_opts);
      $.plot($("#triglyceride_graph"),    [pt.triglyceride_arr],    pt.triglyceride_flot_opts);
      $.plot($("#hdl_graph"),             [pt.hdl_arr],             pt.hdl_flot_opts);
      $.plot($("#bun_graph"),             [pt.bun_arr],             pt.bun_flot_opts);
      $.plot($("#creatinine_graph"),      [pt.creatinine_arr],      pt.creatinine_flot_opts);
      $.plot($("#glucose_graph"),         [pt.glucose_arr],         pt.glucose_flot_opts);
    };

    draw_plots();

    // events
    $('#sort_by_date').on('click',  function(){
      $('#sort_by_date').hide()
      $('#sort_by_alpha').show()
      sort_by_date();
      return false;
    });
    $('#sort_by_alpha').on('click', function(){
      $('#sort_by_alpha').hide()
      $('#sort_by_date').show()
      sort_by_alpha();
      return false;
    });

    // testing lkv overlay. fixme: more specific selector
    $("input[rel]").overlay();
  });
});
