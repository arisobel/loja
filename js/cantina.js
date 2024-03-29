(function($, task) {
"use strict";

function Events1() { // cantina 

	function on_page_loaded(task) {
		
		$("title").text(task.item_caption);
		$("#title").text(task.item_caption);
		  
		if (task.safe_mode) {
			$("#user-info").text(task.user_info.role_name + ' ' + task.user_info.user_name);
			$('#log-out')
			.show() 
			.click(function(e) {
				e.preventDefault();
				task.logout();
			}); 
		}
	
		if (task.full_width) {
			$('#container').removeClass('container').addClass('container-fluid');
		}
		$('#container').show();
		
		task.create_menu($("#menu"), $("#content"), {
			// splash_screen: '<h1 class="text-center">Application</h1>',
			view_first: true
		});
	
		// $(document).ajaxStart(function() { $("html").addClass("wait"); });
		// $(document).ajaxStop(function() { $("html").removeClass("wait"); });
	} 
	
	
	
	function on_view_form_created(item) {
		var table_options_height = item.table_options.height,
			table_container;
	
		item.clear_filters();
		
		item.view_options.table_container_class = 'view-table';
		item.view_options.detail_container_class = 'view-detail';
		item.view_options.open_item = !item.virtual_table;
		
		if (item.view_form.hasClass('modal')) {
			item.view_options.width = 1060;
			item.table_options.height = $(window).height() - 300;
		}
		else {
			if (!item.table_options.height) {
				item.table_options.height = $(window).height() - $('body').height() - 20;
			}
		}
		
		if (item.can_create()) {
			item.view_form.find("#new-btn").on('click.task', function(e) {
				e.preventDefault();
				if (item.master) {
					item.append_record();
				}
				else {
					item.insert_record();
				}
			});
		}
		else {
			item.view_form.find("#new-btn").prop("disabled", true);
		}
	
		item.view_form.find("#edit-btn").on('click.task', function(e) {
			e.preventDefault();
			item.edit_record();
		});
	
		if (item.can_delete()) {
			item.view_form.find("#delete-btn").on('click.task', function(e) {
				e.preventDefault();
				item.delete_record();
			});
		}
		else {
			item.view_form.find("#delete-btn").prop("disabled", true);
		}
		
		create_print_btns(item);
	
		task.view_form_created(item);
		
		if (!item.master && item.owner.on_view_form_created) {
			item.owner.on_view_form_created(item);
		}
	
		if (item.on_view_form_created) {
			item.on_view_form_created(item);
		}
		
		item.create_view_tables();
		
		if (!item.master && item.view_options.open_item) {
			item.open(true);
		}
	
		if (!table_options_height) {
			item.table_options.height = undefined;
		}
		return true;
	}
	
	function on_view_form_shown(item) {
		item.view_form.find('.dbtable.' + item.item_name + ' .inner-table').focus();
	}
	
	function on_view_form_closed(item) {
		if (!item.master && item.view_options.open_item) {	
			item.close();
		}
	}
	
	function on_edit_form_created(item) {
		item.edit_options.inputs_container_class = 'edit-body';
		item.edit_options.detail_container_class = 'edit-detail';
		
		item.edit_form.find("#cancel-btn").on('click.task', function(e) { item.cancel_edit(e) });
		item.edit_form.find("#ok-btn").on('click.task', function() { item.apply_record() });
		if (!item.is_new() && !item.can_modify) {
			item.edit_form.find("#ok-btn").prop("disabled", true);
		}
		
		task.edit_form_created(item);
		
		if (!item.master && item.owner.on_edit_form_created) {
			item.owner.on_edit_form_created(item);
		}
	
		if (item.on_edit_form_created) {
			item.on_edit_form_created(item);
		}
			
		item.create_inputs(item.edit_form.find('.' + item.edit_options.inputs_container_class));
		item.create_detail_views(item.edit_form.find('.' + item.edit_options.detail_container_class));
	
		return true;
	}
	
	function on_edit_form_close_query(item) {
		var result = true;
		if (!item.virtual_table && item.is_changing()) {
			if (item.is_modified()) {
				item.yes_no_cancel(task.language.save_changes,
					function() {
						item.apply_record();
					},
					function() {
						item.cancel_edit();
					}
				);
				result = false;
			}
			else {
				item.cancel_edit();
			}
		}
		return result;
	}
	
	function on_filter_form_created(item) {
		item.filter_options.title = item.item_caption + ' - filters';
		item.create_filter_inputs(item.filter_form.find(".edit-body"));
		item.filter_form.find("#cancel-btn").on('click.task', function() {
			item.close_filter_form(); 
		});
		item.filter_form.find("#ok-btn").on('click.task', function() { 
			item.set_order_by(item.view_options.default_order);
			item.apply_filters(item._search_params); 
		});
	}
	
	function on_param_form_created(item) {
		item.create_param_inputs(item.param_form.find(".edit-body"));
		item.param_form.find("#cancel-btn").on('click.task', function() { 
			item.close_param_form();
		});
		item.param_form.find("#ok-btn").on('click.task', function() { 
			item.process_report();
		});
	}
	
	function on_before_print_report(report) {
		var select;
		report.extension = 'pdf';
		if (report.param_form) {
			select = report.param_form.find('select');
			if (select && select.val()) {
				report.extension = select.val();
			}
		}
	}
	
	function on_view_form_keyup(item, event) {
		if (event.keyCode === 45 && event.ctrlKey === true){
			if (item.master) {
				item.append_record();
			}
			else {
				item.insert_record();				
			}
		}
		else if (event.keyCode === 46 && event.ctrlKey === true){
			item.delete_record(); 
		}
	}
	
	function on_edit_form_keyup(item, event) {
		if (event.keyCode === 13 && event.ctrlKey === true){
			item.edit_form.find("#ok-btn").focus(); 
			item.apply_record();
		}
	}
	
	function create_print_btns(item) {
		var i,
			$ul,
			$li,
			reports = [];
		if (item.reports) {
			for (i = 0; i < item.reports.length; i++) {
				if (item.reports[i].can_view()) {
					reports.push(item.reports[i]);
				}
			}
			if (reports.length) {
				$ul = item.view_form.find("#report-btn ul");
				for (i = 0; i < reports.length; i++) {
					$li = $('<li><a href="#">' + reports[i].item_caption + '</a></li>');
					$li.find('a').data('report', reports[i]);
					$li.on('click', 'a', function(e) {
						e.preventDefault();
						$(this).data('report').print(false);
					});
					$ul.append($li);
				}
			}
			else {
				item.view_form.find("#report-btn").hide();
			}
		}
		else {
			item.view_form.find("#report-btn").hide();
		}
	}
	this.on_page_loaded = on_page_loaded;
	this.on_view_form_created = on_view_form_created;
	this.on_view_form_shown = on_view_form_shown;
	this.on_view_form_closed = on_view_form_closed;
	this.on_edit_form_created = on_edit_form_created;
	this.on_edit_form_close_query = on_edit_form_close_query;
	this.on_filter_form_created = on_filter_form_created;
	this.on_param_form_created = on_param_form_created;
	this.on_before_print_report = on_before_print_report;
	this.on_view_form_keyup = on_view_form_keyup;
	this.on_edit_form_keyup = on_edit_form_keyup;
	this.create_print_btns = create_print_btns;
}

task.events.events1 = new Events1();

function Events8() { // cantina.journals.venda 

	function on_detail_changed(item, detail) {
		var fields;
		if (detail.item_name === 'itens_venda') {
			fields = [
				{"total": "subtotal"},
			];
			item.calc_summary(detail, fields);
		}
	}
	
	
	
	
	//function on_field_changed(field, lookup_item) {
	//	var item = field.owner;
	//	if (field.field_name === 'produto' && lookup_item) {
	//		item.preco.value = lookup_item.preco.value;
	//	}
	//}
	this.on_detail_changed = on_detail_changed;
}

task.events.events8 = new Events8();

function Events9() { // cantina.details.itens_venda 

	function on_field_changed(field, lookup_item) {
		var item = field.owner;
		if (field.field_name === 'produto' && lookup_item) {
			item.preco.value = lookup_item.preco.value;
		}
	}
	this.on_field_changed = on_field_changed;
}

task.events.events9 = new Events9();

function Events10() { // cantina.journals.venda.itens_venda 

	function calc(il){
		
		il.subtotal.value = il.quantidade.value * (il.preco.value - il.desconto.value);
	}
	
	function on_field_changed(field, lk_item) { 
		//debugger;
		var invoice_line = field.owner;
		
		if (field.field_name === 'produto') {
		  
			invoice_line.preco.value = lk_item.preco.value;
		}else if (field.field_name === 'quantidade' || field.field_name === 'desconto' || field.field_name === 'preco') {
			
			calc(invoice_line);
		}
		
	}
	this.calc = calc;
	this.on_field_changed = on_field_changed;
}

task.events.events10 = new Events10();

function Events11() { // cantina.journals.pagamentos 

	// calcula como aplicar o pagaentos nas notas abetrtas
	
	function on_before_post(item) {
		debugger;
		var cli = item.cliente.value;
		var val = item.valor.value;
		var saldo = val;
		var deb =0 ;
		var ds = task.venda.copy();
		//carrega o dataset
		ds.open({where:{cliente: cli}});
			var tot_deb=0;
			ds.each(function(ds){
				deb = ds.total.value;
				alert(ds.id.value + ' ' + deb);
				ds.edit();			
				if(saldo>=deb){
					
					ds.saldo.value = 0;
					ds.pago.value = deb;
				}else if(saldo<deb){
					ds.saldo.value = deb - saldo;
					ds.pago.value = saldo;				
				}
				ds.post();
				tot_deb+=ds.total.value;
				saldo-=ds.total.value;
			}
		)
		item.alert(tot_deb);
		ds.apply();
	
	}
	this.on_before_post = on_before_post;
}

task.events.events11 = new Events11();

})(jQuery, task)