function open_tv(url,title,live){
	const ubWindow = utools.createBrowserWindow('tv_show.html?url='+encodeURIComponent(url)+'&title='+encodeURIComponent(title)+'&live='+encodeURIComponent(live), {
		show: true,
		title: title
	});
}

function open_radio(url,title,live){
	const ubWindow = utools.createBrowserWindow('radio_show.html?url='+encodeURIComponent(url)+'&title='+encodeURIComponent(title)+'&live='+encodeURIComponent(live), {
		show: true,
		title: '电台直播',
		width:300,
		height:150
	});
}

function tv_radio_div(url,title,imgurl,zbf,open_func){
	return 	'<div class="layui-panel layui-col-xs2 cc" onclick="'+open_func+'(\''+url+'\',\''+title+'\',\''+zbf+'\')">'+
			'	<img class="imgg" src="'+imgurl+'" onError="this.src=\'logo.png\';"/>'+
			'	<div>'+title+'</div>'+
			'</div>';
}

utools.onPluginReady(() => {
	console.log('插件装配完成，已准备好');
	utools.onPluginEnter(({code, type, payload}) => {
		console.log('用户进入插件', code, type, payload);
		
		var global_url = 'http://xxx.com/api/file/read';
		
		layui.use(['layer', 'form','tree', 'util','element','table'], function(){
			var layer = layui.layer
			   ,$ = layui.$
			   ,tree = layui.tree
			   ,util = layui.util
			   ,form = layui.form
			   ,element = layui.element
			   ,table = layui.table;
			
			//layer.msg('Hello World');
			
			/*****************************************/
			//将卡片加到‘电视’栏目
			function add_tv(url,title,imgurl){
				$("#ifm").append(tv_radio_div(url,title,imgurl,'Y','open_tv'));
			}
			//将卡片加到‘电台’栏目（不包含‘电台-省市’）
			function add_radio(url,title,imgurl){
				$("#ifm").append(tv_radio_div(url,title,imgurl,'Y','open_radio'));
			}
			//将卡片加到‘电台-省市’栏目
			function add_radio_ss(url,title,imgurl){
				$("#radio_row_ss_lb").append(tv_radio_div(url,title,imgurl,'Y','open_radio'));
			}

			//请求‘电视’、‘电台-国家’、‘电台-网络’的数据
			function get_tvorradio(url,type,flag,ssname){
				$.ajax({
					url:url,
					type:'GET',
					dataType:'JSON',
					data:{path:'./TVandRADIO/'+type+'.json'},
					success: (res) => {
						// 状态码 200 表示请求成功
						if(res.code === 200){
							var tvradio_data = eval('(' + res.data.content + ')');
							if (flag==='1'){
								if (type.substr(0,2)==='tv'){
									for (var i = 0; i < tvradio_data.length; i++){
										add_tv(tvradio_data[i].url,tvradio_data[i].title,tvradio_data[i].logo);
									}
								}else if (type.substr(0,5)==='radio'){
									for (var i = 0; i < tvradio_data.length; i++){
										add_radio(tvradio_data[i].url,tvradio_data[i].title,tvradio_data[i].logo);
									}
								}
							}else if (flag==='2'){
								for (var i = 0; i < tvradio_data.length; i++){
									add_radio_ss(tvradio_data[i].url,tvradio_data[i].title,tvradio_data[i].logo);
								}
								$("#radio_row_ss_lb_header").empty();
								$("#radio_row_ss_lb_header").append('<span>电台列表 - '+ssname+'</span>');
							}
						}else{
							console.log(res);
						}
					}
				});
			}

			//右侧网页填充
			function load_sub(subPage,type){
				$("#ifm").empty();
				if (subPage!=='javascript:;'){
					$("#ifm").load(subPage,function(responseTxt,statusTxt,xhr){
						if(statusTxt=="success"){
							ss_auto_height();
						}
						if(statusTxt=="error"){
							alert("Error: "+xhr.status+": "+xhr.statusText);
						}
					});
				}
				if (type==='radio_ss'){
					get_tvorradio(global_url,'radio_ss_110000','2','北京市');
				}else{
					get_tvorradio(global_url,type,'1','');
				}
			}
			/*****************************************/
			
			//初始化要显示数据
			load_sub('javascript:;','tv_ys');
			
			//自定义页面取值，并显示到画面上
			function get_zdy(){
				table.render({
					elem: '#zdy_lb'
					,title: '用户数据表'
					,data: utools.db.allDocs("zdy_")
					,size: 'sm'
					,even: true
					,height: 'full-40'
					,limit: utools.db.allDocs("zdy_").length
					,cols: [[
						{field:'title', title:'栏目名', width:120, fixed: 'left', sort: true}
						,{field:'url', title:'栏目地址'}
						,{field:'zbf', title:'直播否', width:95,sort: true,templet: '#switchTpl1'}
						//,{field:'sy', title:'视频OR音频', width:115,sort: true,templet: '#switchTpl2',}
						,{fixed: 'right', title:'操作', toolbar: '#barDemo', width:100}
					]]
				});
			}
			
			//监听导航点击
			element.on('nav(left_menu_filter)', function(elem){
				//console.log(elem);
				//layer.msg(elem.text());
				var href = elem.attr("href");
				var mytype = elem.attr("mytype");
				
				//底部的‘新增频道’只有在‘自定义’页面才显示
				if (mytype !== 'und'){
					$("#footToolBar_add_pd").hide();
				}
				//点击分类，加载页面
				if (mytype !== 'und' && mytype !== 'zdy' && mytype !== 'sc'){
					load_sub(href,mytype);
				}
				if (mytype === 'zdy'){
					$("#ifm").empty();
					$("#ifm").load('./zdy.html',function(responseTxt,statusTxt,xhr){
						if(statusTxt=="success"){
							get_zdy();
							$("#footToolBar_add_pd").show();
						}
						if(statusTxt=="error"){
							alert("Error: "+xhr.status+": "+xhr.statusText);
						}
					});
				}
				if (mytype === 'sc'){
					$("#ifm").empty();
					$("#ifm").append("敬请期待");
				}
			});
			
			//‘电台-省市’切换
			$(document).on('click','.radio_row_ss_ss_dj',function (e) {
				e.preventDefault();
				var myid = $(this).attr("myid");
				var ssname = $(this).text();
				$("#radio_row_ss_lb").empty();
				get_tvorradio(global_url,'radio_ss_'+myid,'2',ssname);
			});
			
			//设置‘电台-省市’页面自动高度
			window.onscroll = function () { ss_auto_height(); };
			window.onresize = function () { ss_auto_height(); };
			window.onload = function () { ss_auto_height(); };
			function ss_auto_height() {
				var h = document.getElementById("ifm").offsetHeight-65;
				$("#radio_row_ss_ss").css({height: h });
				$("#radio_row_ss_ss").css('overflow-y', 'auto' );
				$("#radio_row_ss_lb").css({height: h });
				$("#radio_row_ss_lb").css('overflow-y', 'auto' );
			}
			
			/*****************自定义页面事件******************/
			var zdy_sz = '<div style="margin:20px 20px 0px 20px;">'+
						 '	<form class="layui-form layui-form-pane" action="" lay-filter="formset_form">'+
						 '		<div class="layui-form-item" hidden>'+
						 '			<label class="layui-form-label">id</label>'+
						 '			<div class="layui-input-block">'+
						 '				<input type="text" id="lm_id" name="lm_id" autocomplete="off" class="layui-input">'+
						 '			</div>'+
						 '		</div>'+
						 '		<div class="layui-form-item">'+
						 '			<label class="layui-form-label">栏目名</label>'+
						 '			<div class="layui-input-block">'+
						 '				<input type="text" id="lm_title" name="lm_title" required  lay-verify="required" placeholder="例如：CCTV1" autocomplete="off" class="layui-input">'+
						 '			</div>'+
						 '		</div>'+
						 '		<div class="layui-form-item">'+
						 '			<label class="layui-form-label">栏目地址</label>'+
						 '			<div class="layui-input-block" style="position: relative;">'+
						 '				<input type="text" id="lm_url" name="lm_url" required  lay-verify="required" placeholder="可选网络地址、本地音视频" autocomplete="off" class="layui-input">'+
						 '				<span id="form_getfile" style="position: absolute;right:1px;top:10px;padding:0 8px 0 5px;background:#fff;"><i class="layui-icon layui-icon-file"></i></span>'+
						 '			</div>'+
						 '		</div>'+
						 '		<div class="layui-form-item">'+
						 '			<label class="layui-form-label">是否直播</label>'+
						 '			<div class="layui-input-inline">'+
						 '				<input type="checkbox" name="lm_zb" lay-skin="switch" lay-text="直播|非直播" checked>'+
						 '			</div>'+
						 //'			<label class="layui-form-label">视频OR音频</label>'+
						 //'			<div class="layui-input-inline">'+
						 //'				<input type="checkbox" name="lm_sp" lay-skin="switch" lay-text="视频|音频" checked>'+
						 //'			</div>'+
						 '		</div>'+
						 '		<div class="layui-form-item" hidden>'+
						 '			<label class="layui-form-label">rev</label>'+
						 '			<div class="layui-input-block">'+
						 '				<input type="text" id="lm_rev" name="lm_rev" autocomplete="off" class="layui-input">'+
						 '			</div>'+
						 '		</div>'+
						 '		<div class="layui-form-item" hidden>'+
						 '			<div class="layui-input-inline">'+
						 '				<button id="id_formset" class="layui-btn" lay-submit lay-filter="formset">提交</button>'+
						 '			</div>'+
						 '		</div>'+
						 '	</form>'+
						 '</div>'
			
			//新增频道事件
			$(document).on('click','#footToolBar_add_pd',function (e) {
				var that = this;
				layer.open({
					title: false,
					content: zdy_sz,
					type: 1,
					btn: ['确定','取消'],
					success: function(layero, index){
						//console.log(layero, index);
						// 解决按enter键重复弹窗问题
						$(':focus').blur();
						form.render();
						//监听提交
						form.on('submit(formset)', function(data){
							//layer.alert(JSON.stringify(data.field));
							//var rep = utools.db.get('zdy_'+data.field.lm_title);
							var rep = utools.db.put({
								_id: 'zdy_'+data.field.lm_title
								,title: data.field.lm_title
								,url: data.field.lm_url
								,zbf: data.field.lm_zb
								//,sy: data.field.lm_sp
							});
							if (rep.ok){
								layer.close(index);
							}else{
								layer.msg(data.field.lm_title+"--已存在");
							}
							get_zdy();
							return false;
						});
					},
					yes: function(index, layero){
						//do something
						//layer.close(index); //如果设定了yes回调，需进行手工关闭
						$("#id_formset").click();
					}
				});
			});
			
			form.on('switch', function(data) {
				$(data.elem).attr('type', 'hidden').val(this.checked ? 'on' : 'off');
			});
			
			//监听行双击事件（单击事件为：row）
			table.on('rowDouble(zdy_lb)', function(obj){
				var data = obj.data;
				
				//layer.alert(JSON.stringify(data), {
				//	title: '当前行数据：'
				//});
				var title = data.title;
				var url = data.url;
				var live = '';
				if (data.zbf==='on'){
					live = 'Y'
				}else{
					live = 'N'
				}
				//var sy = data.sy;
				//if (sy==='on'){
					open_tv(url,title,live);
				//}else{
				//	open_radio(url,title,live);
				//}
				
				//标注选中样式
				obj.tr.addClass('layui-table-click').siblings().removeClass('layui-table-click');
			});
			
			//监听行工具事件
			table.on('tool(zdy_lb)', function(obj){
				var fdata = obj.data;
				//console.log(obj)
				if(obj.event === 'del'){
					layer.confirm('真的删除么', function(index){
						obj.del();
						utools.db.remove(fdata._id);
						layer.close(index);
					});
				} else if(obj.event === 'edit'){
					layer.open({
						title: false,
						content: zdy_sz,
						type: 1,
						btn: ['确定','取消'],
						success: function(layero, index){
							// 解决按enter键重复弹窗问题
							$(':focus').blur();
							form.render();
							//禁用标题栏
							$("#lm_title").attr("disabled","disabled");
							$("#lm_title").addClass("layui-disabled");
							//表单赋值
							var zbf = ''
							if (fdata.zbf==='on'){
								zbf = true
							}else{
								zbf = false
							}
							//var sy = ''
							//if (fdata.sy==='on'){
							//	sy = true
							//}else{
							//	sy = false
							//}
							form.val("formset_form", {
								"lm_id": fdata._id
								,"lm_title": fdata.title
								,"lm_url": fdata.url
								,"lm_zb": zbf
								//,"lm_sp": sy
								,"lm_rev": fdata._rev
							});
							//监听提交
							form.on('submit(formset)', function(data){
								//layer.alert(JSON.stringify(data.field));
								var rep = utools.db.put({
									_id: data.field.lm_id
									,title: data.field.lm_title
									,url: data.field.lm_url
									,zbf: data.field.lm_zb
									//,sy: data.field.lm_sp
									,_rev: data.field.lm_rev
								});
								if (rep.ok){
									layer.close(index);
								}else{
									layer.msg(data.field.lm_title+"--已存在");
								}
								get_zdy();
								return false;
							});
						},
						yes: function(index, layero){
							//do something
							//layer.close(index); //如果设定了yes回调，需进行手工关闭
							$("#id_formset").click();
						}
					});
				}
			});
			
			//开窗选择文件
			$(document).on('click','#form_getfile',function (e) {
				var filelist = utools.showOpenDialog({
					properties: ['openFile']
				});
				$("#lm_url").val(filelist[0]);
			});
			/*****************自定义页面事件******************/

			//页脚‘关于’
			var about_str = '<div class="layui-card-header">温馨提示</div>'+
							'<div class="layui-card-body layui-text">'+
							'	<blockquote class="layui-elem-quote" style="border: none;">'+
							'		为了获得更好的体验，建议您点击右上角的<span class="layui-badge layui-bg-blue"><i class="layui-icon layui-icon-more-vertical"></i></span>，选择<span class="layui-badge layui-bg-blue">插件选项--自动分离窗口</span>'+
							'	</blockquote>'+
							'	<div><a class="about_more" href="https://www.douyin.com">在线刷抖音</a></div>'+
							'	<div><a class="about_more" href="https://www.toutiao.com">在线刷头条</a></div>'+
							'	<p>© <span id="about_banquan_nian"></span> <a id="about_banquan_a" href="https://wangxingyi.top">懒猫</a> 版权所有</p>'+
							'</div>'
			$(document).on('click','#footToolBar_about',function (e) {
				layer.open({
					type: 1
					//,id: 'LAY_adminPopupR'
					,anim: -1
					,title: false
					,closeBtn: false
					,content: about_str
					,offset: 'r'
					,shade: 0.1
					,shadeClose: true
					,skin: 'layui-anim layui-anim-rl layui-layer-adminRight'
					,area: '210px'
					,success: function(layero, index){
						var current_date = new Date();
						var year = current_date.getFullYear();
						$("#about_banquan_nian").empty();
						$("#about_banquan_nian").append(year);
					}
				});
			});
			//点击链接，用默认浏览器打开
			$(document).on('click','#about_banquan_a',function(e){
				utools.shellOpenExternal(this.href);
			});
			$(document).on('click','.about_more',function(e){
				utools.ubrowser.goto(this.href)
					.run({ width: 800, height: 550, alwaysOnTop: true})
			});
			
		});
	});
});