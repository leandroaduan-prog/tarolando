// Lista de picos do Tá Rolando?
// Para incluir ou corrigir um pico, edite a lista RAW abaixo.
// Formato: [nome, cidade, UF, latitude, longitude, praia virada para (graus), exposição, nível, marcas, dica]
// Marcas: S = isolado, B = laje/ondas grandes, T = área de risco de tubarão, P = pororoca.
// Exposição: 1 = recebe o swell em cheio; menor = mais protegida; maior = amplifica (lajes).
/* [nome, cidade, UF, lat, lon, praia virada para (graus), exposição, nível, marcas, dica]
   marcas: S = isolado, B = laje/ondas grandes, T = área de risco de tubarão, P = pororoca. Coordenadas aproximadas. */
export const RAW=[
/* PA */
["Atalaia","Salinópolis","PA",-0.590,-47.310,20,.75,"IM"],["Ajuruteua","Bragança","PA",-0.830,-46.600,40,.7,"IM"],
["Pororoca do Rio Capim","São Domingos do Capim","PA",-1.677,-47.766,0,1,"A","P","Onda de maré que avança rio e floresta adentro."],
/* MA */
["São Marcos","São Luís","MA",-2.490,-44.270,340,.8,"IM"],["Calhau","São Luís","MA",-2.480,-44.240,10,.75,"IM"],["Araçagi","São José de Ribamar","MA",-2.460,-44.200,20,.75,"IM"],
["Pororoca do Rio Mearim","Arari","MA",-3.455,-44.780,0,1,"A","P","Onda de rio longa. Precisa de apoio de jet-ski."],
/* PI */
["Pedra do Sal","Parnaíba","PI",-2.810,-41.730,350,.9,"M"],["Praia do Coqueiro","Luís Correia","PI",-2.900,-41.580,10,.75,"IM"],
/* CE */
["Jericoacoara (Malhada)","Jijoca de Jericoacoara","CE",-2.795,-40.510,0,1,"MA"],
["Flecheiras","Trairi","CE",-3.220,-39.270,10,.9,"M"],["Guajiru","Trairi","CE",-3.240,-39.230,10,.85,"IM"],["Emboaca","Trairi","CE",-3.260,-39.180,20,.85,"IM"],
["Curcurutu","Paracuru","CE",-3.420,-39.060,20,.9,"M"],["Ronco do Mar","Paracuru","CE",-3.410,-39.050,10,.95,"M"],["Boca do Poço","Paracuru","CE",-3.400,-39.040,10,1,"MA"],["Pedra Rachada","Paracuru","CE",-3.395,-39.025,10,1,"MA"],
["Taíba (Morro e Taibinha)","São Gonçalo do Amarante","CE",-3.510,-38.905,30,.9,"M"],
["Cumbuco","Caucaia","CE",-3.625,-38.730,20,.85,"IM"],["Pico das Almas","Caucaia","CE",-3.680,-38.650,20,.9,"M"],["Icaraí","Caucaia","CE",-3.690,-38.630,20,.85,"IM"],
["Praia Formosa (Leste Oeste)","Fortaleza","CE",-3.715,-38.530,0,.85,"M"],["Praia de Iracema","Fortaleza","CE",-3.720,-38.510,20,.8,"IM"],["Titanzinho","Fortaleza","CE",-3.710,-38.470,20,.95,"M"],["Praia do Futuro","Fortaleza","CE",-3.745,-38.450,60,.85,"IM"],
["Prainha","Aquiraz","CE",-3.860,-38.370,60,.8,"IM"],["Abreulândia / Cofeco","Aquiraz","CE",-3.900,-38.330,60,.85,"M"],
/* RN */
["Galinhos","Galinhos","RN",-5.090,-36.270,0,1,"M","S","Vento muito forte. Acesso de balsa ou 4x4, com picos desertos."],
["São Miguel do Gostoso","São Miguel do Gostoso","RN",-5.120,-35.635,20,.9,"M"],
["Praia dos Artistas","Natal","RN",-5.775,-35.195,60,.8,"IM"],["Via Costeira","Natal","RN",-5.840,-35.180,80,.85,"M"],["Ponta Negra","Natal","RN",-5.880,-35.170,110,.8,"IM"],
["Cotovelo","Parnamirim","RN",-5.960,-35.130,100,.85,"IM"],
["Madeiro","Tibau do Sul","RN",-6.210,-35.050,90,.85,"IM"],["Baía dos Golfinhos","Tibau do Sul","RN",-6.225,-35.045,80,.7,"I"],["Praia do Amor","Tibau do Sul","RN",-6.230,-35.045,100,.95,"M"],["Cacimbinhas","Tibau do Sul","RN",-6.235,-35.040,110,.95,"M"],["Lajão","Tibau do Sul","RN",-6.240,-35.038,110,1,"MA"],
["O Pontal","Baía Formosa","RN",-6.370,-35.005,60,1,"MA"],["Praia da Cacimba","Baía Formosa","RN",-6.378,-35.000,80,.85,"IM"],["Picão","Baía Formosa","RN",-6.380,-34.990,70,1,"MA"],["Mar Aberto","Baía Formosa","RN",-6.400,-34.980,110,1,"M"],
/* PB */
["Bessa","João Pessoa","PB",-7.070,-34.835,80,.7,"I"],["Intermares","Cabedelo","PB",-7.050,-34.845,70,.75,"I"],["Coqueirinho","Conde","PB",-7.310,-34.800,90,.8,"IM"],
/* PE */
["Cacimba do Padre","Fernando de Noronha","PE",-3.848,-32.440,330,1.2,"A"],["Laje do Bode","Fernando de Noronha","PE",-3.852,-32.437,330,1.3,"A","B"],["Biboca","Fernando de Noronha","PE",-3.855,-32.445,330,1,"MA"],
["Boldró","Fernando de Noronha","PE",-3.845,-32.432,340,1,"MA"],["Praia do Cachorro","Fernando de Noronha","PE",-3.835,-32.405,340,.9,"M"],["Conceição","Fernando de Noronha","PE",-3.837,-32.410,330,.95,"M"],
["Zé Pequeno","Olinda","PE",-7.995,-34.840,90,.85,"M","T","Surf em recifes de coral urbanos."],["Milagres","Olinda","PE",-8.010,-34.845,90,.85,"M","T","Surf em recifes de coral urbanos."],
["Paiva","Cabo de Santo Agostinho","PE",-8.260,-34.945,100,.9,"M","T"],["Itapuama","Cabo de Santo Agostinho","PE",-8.300,-34.950,100,.9,"M"],["Gaibu","Cabo de Santo Agostinho","PE",-8.320,-34.950,100,.85,"IM"],
["Borete","Ipojuca","PE",-8.460,-34.985,100,.85,"IM"],["Cupe","Ipojuca","PE",-8.470,-34.990,100,.85,"IM"],["Maracaípe","Ipojuca","PE",-8.530,-35.005,110,1,"M"],
/* AL */
["Jatiúca","Maceió","AL",-9.650,-35.705,110,.7,"I"],["Praia do Francês","Marechal Deodoro","AL",-9.770,-35.840,120,.85,"IM"],["Barra de São Miguel","Barra de São Miguel","AL",-9.840,-35.900,130,.75,"IM"],
/* SE */
["Atalaia","Aracaju","SE",-10.990,-37.040,120,.85,"IM"],["Praia do Saco","Estância","SE",-11.380,-37.320,120,.85,"IM"],
/* BA */
["Baixio","Esplanada","BA",-12.110,-37.700,110,.85,"IM"],
["Imbassaí","Mata de São João","BA",-12.490,-37.950,110,.85,"IM"],["Catingtiba","Mata de São João","BA",-12.550,-37.975,110,.85,"IM"],["Praia do Forte","Mata de São João","BA",-12.578,-38.000,110,.85,"IM"],
["Arembepe","Camaçari","BA",-12.760,-38.170,120,.9,"M"],
["Flamengo","Salvador","BA",-12.930,-38.310,120,.95,"M"],["Aleluia","Salvador","BA",-12.937,-38.325,125,.95,"M"],["Stella Maris","Salvador","BA",-12.945,-38.335,130,1,"M"],["Piatã","Salvador","BA",-12.955,-38.380,140,.85,"IM"],
["Jaguaribe","Salvador","BA",-12.965,-38.400,150,.9,"M"],["Praia da Barra (Farol)","Salvador","BA",-13.010,-38.533,190,.85,"M","","Funciona com vento norte."],
["Segunda Praia (Morro de São Paulo)","Cairu","BA",-13.380,-38.910,90,.7,"IM"],["Quarta Praia","Cairu","BA",-13.400,-38.920,100,.75,"IM"],
["Resende","Itacaré","BA",-14.300,-38.995,100,.95,"M"],["Tiririca","Itacaré","BA",-14.290,-38.990,100,1,"MA"],["Prainha","Itacaré","BA",-14.310,-38.995,100,1,"M"],["Engenhoca","Itacaré","BA",-14.322,-39.003,100,1,"M"],
["Havaizinho","Itacaré","BA",-14.335,-39.007,100,.95,"M"],["Jeribucaçu","Itacaré","BA",-14.350,-39.010,100,.95,"M"],["Itacarezinho","Itacaré","BA",-14.360,-39.020,110,.95,"M"],
["Serra Grande","Uruçuca","BA",-14.475,-39.030,100,.9,"M"],
["Praia dos Milionários","Ilhéus","BA",-14.830,-39.030,100,.85,"IM"],["Olivença","Ilhéus","BA",-14.950,-39.010,100,1,"M","","Picos Backdoor e Batuba."],
["Itaquena","Porto Seguro","BA",-16.650,-39.130,110,1,"M","S","Acesso só a pé, por trilha longa a partir de Trancoso, ou de 4x4."],
/* ES */
["Itaúnas","Conceição da Barra","ES",-18.420,-39.700,80,.9,"M"],
["Povoação","Linhares","ES",-19.590,-39.790,100,1,"M"],["Regência","Linhares","ES",-19.655,-39.818,110,1,"M","","Ondas tubulares longas na foz do Rio Doce."],
["Jacaraípe","Serra","ES",-20.150,-40.185,90,.9,"IM"],["Manguinhos","Serra","ES",-20.190,-40.190,90,.85,"IM"],
["Praia de Camburi","Vitória","ES",-20.270,-40.290,70,.5,"I"],["Curva da Jurema","Vitória","ES",-20.310,-40.290,90,.5,"I"],
["Praia da Costa","Vila Velha","ES",-20.335,-40.280,100,.7,"IM"],["Itapoã","Vila Velha","ES",-20.350,-40.290,100,.75,"IM"],["Itaparica","Vila Velha","ES",-20.360,-40.295,100,.8,"IM"],
["Barra do Jucu","Vila Velha","ES",-20.420,-40.320,110,1,"M","","Picos do Cemitério e do Postinho."],
["Setiba","Guarapari","ES",-20.625,-40.420,120,.9,"M"],["Praia do Morro","Guarapari","ES",-20.655,-40.488,110,.8,"I"],["Areia Preta","Guarapari","ES",-20.670,-40.495,110,.7,"IM"],["Ulé","Guarapari","ES",-20.680,-40.505,120,.9,"M"],
["Ubu","Anchieta","ES",-20.800,-40.590,130,.85,"IM"],
["Marataízes","Marataízes","ES",-21.040,-40.830,110,.95,"M","S","Picos isolados, estrada de terra e quase sem crowd."],
["Praia das Neves","Presidente Kennedy","ES",-21.250,-40.950,110,1,"M","S","Pico isolado, estrada de terra e quase sem crowd."],
/* RJ */
["Praia do Campista","Macaé","RJ",-22.390,-41.775,110,.8,"IM"],["Praia do Pecado","Macaé","RJ",-22.400,-41.790,110,.85,"M"],
["Brava de Búzios","Armação dos Búzios","RJ",-22.745,-41.870,80,.95,"M"],["Geribá","Armação dos Búzios","RJ",-22.780,-41.910,170,.9,"IM"],["Tucuns","Armação dos Búzios","RJ",-22.790,-41.925,170,.9,"M"],["José Gonçalves","Armação dos Búzios","RJ",-22.810,-41.960,170,.9,"M"],
["Peró","Cabo Frio","RJ",-22.850,-41.990,80,.85,"IM"],["Brava de Cabo Frio","Cabo Frio","RJ",-22.875,-41.985,100,.95,"M"],["Praia do Forte","Cabo Frio","RJ",-22.885,-42.020,150,.8,"IM"],["Praia do Foguete","Cabo Frio","RJ",-22.920,-42.050,160,.95,"M"],
["Praia Brava","Arraial do Cabo","RJ",-22.975,-42.000,120,1,"MA","S","Acesso por trilha no Morro do Pontal."],["Praia Grande","Arraial do Cabo","RJ",-22.972,-42.035,190,1,"M"],
["Boqueirão","Saquarema","RJ",-22.930,-42.430,165,1,"M"],["Barrinha","Saquarema","RJ",-22.935,-42.460,170,1.15,"A","","Onda pesadíssima sobre laje de pedra."],["Itaúna","Saquarema","RJ",-22.935,-42.485,160,1.15,"MA"],
["Praia da Vila","Saquarema","RJ",-22.935,-42.495,160,1,"M"],["Vilatur","Saquarema","RJ",-22.940,-42.560,170,1,"M"],
["Ponta Negra","Maricá","RJ",-22.958,-42.690,170,1,"MA"],
["Laje Mãe","Niterói","RJ",-22.985,-43.025,170,1.3,"A","B","Só funciona em swells históricos."],["Itacoatiara","Niterói","RJ",-22.975,-43.035,170,1.1,"A","","O beach break mais pesado do estado."],
["Sossego","Niterói","RJ",-22.965,-43.060,170,.95,"M"],["Piratininga","Niterói","RJ",-22.950,-43.080,170,.9,"M"],
["Leme","Rio de Janeiro","RJ",-22.963,-43.168,140,.75,"IM"],["Copacabana (Posto 5)","Rio de Janeiro","RJ",-22.976,-43.188,140,.75,"IM"],["Laje do Shock","Rio de Janeiro","RJ",-22.990,-43.185,170,1.15,"A","B","Bancada rasa que muda de forma."],
["Arpoador","Rio de Janeiro","RJ",-22.989,-43.192,170,.9,"M"],["Ipanema (Teixeira)","Rio de Janeiro","RJ",-22.987,-43.205,180,.85,"M"],["Laje do Vidigal","Rio de Janeiro","RJ",-22.995,-43.240,180,1.2,"A","B","Atrás do Morro Dois Irmãos."],
["São Conrado","Rio de Janeiro","RJ",-22.999,-43.268,175,.85,"M","","Canto esquerdo: bodyboard e surf pesado."],["Joatinga","Rio de Janeiro","RJ",-23.015,-43.290,180,1,"MA"],
["Barra da Tijuca (Postinho e Píer)","Rio de Janeiro","RJ",-23.011,-43.355,175,.95,"M"],["Recreio","Rio de Janeiro","RJ",-23.025,-43.460,180,.9,"M","","Melhor no canto e no Posto 12."],
["Macumba","Rio de Janeiro","RJ",-23.033,-43.483,175,.9,"IM"],["Prainha","Rio de Janeiro","RJ",-23.041,-43.507,180,1.05,"MA"],["Grumari","Rio de Janeiro","RJ",-23.048,-43.525,175,.95,"M"],["Guaratiba","Rio de Janeiro","RJ",-23.065,-43.570,180,.85,"IM"],
["Trindade","Paraty","RJ",-23.345,-44.720,140,.9,"M"],
/* SP */
["Praia da Fazenda","Ubatuba","SP",-23.360,-44.840,120,.85,"IM"],["Félix","Ubatuba","SP",-23.385,-44.965,140,.95,"M"],["Itamambuca","Ubatuba","SP",-23.405,-45.010,115,1.05,"MA"],
["Laje de Itamambuca","Ubatuba","SP",-23.412,-44.995,115,1.25,"A","B","Laje em frente a Itamambuca. Liga com swell grande."],
["Vermelha do Norte","Ubatuba","SP",-23.418,-45.040,125,1,"M"],["Perequê-Açu","Ubatuba","SP",-23.416,-45.060,110,.7,"I"],["Tenório","Ubatuba","SP",-23.455,-45.060,120,.8,"IM"],["Praia Grande","Ubatuba","SP",-23.467,-45.064,140,.7,"I"],
["Toninhas","Ubatuba","SP",-23.488,-45.080,150,.8,"IM"],["Vermelha do Sul","Ubatuba","SP",-23.505,-45.110,160,.9,"M"],["Sapê","Ubatuba","SP",-23.507,-45.161,160,.85,"IM"],["Praia Dura","Ubatuba","SP",-23.495,-45.170,150,.85,"M"],
["Castelhanos","Ilhabela","SP",-23.860,-45.290,90,.9,"M","S","Lado de fora da ilha. Acesso por estrada de terra 4x4 ou barco."],["Bonete","Ilhabela","SP",-23.938,-45.339,165,1.15,"A","S"],
["Guaecá","São Sebastião","SP",-23.820,-45.460,150,.9,"M"],["Calhetas","São Sebastião","SP",-23.840,-45.500,160,.85,"M"],["Toque-Toque Pequeno","São Sebastião","SP",-23.835,-45.510,170,.85,"M"],
["Paúba","São Sebastião","SP",-23.800,-45.540,160,1,"MA","","Tubo seco e perigoso."],["Maresias","São Sebastião","SP",-23.792,-45.565,170,1.1,"MA"],["Boiçucanga","São Sebastião","SP",-23.786,-45.620,180,.85,"IM"],
["Praia Brava do Camburi","São Sebastião","SP",-23.785,-45.630,165,1.05,"MA","S","Trilha íngreme. Quase sempre vazia e muito consistente."],["Camburizinho","São Sebastião","SP",-23.778,-45.640,175,.9,"M"],
["Camburi","São Sebastião","SP",-23.775,-45.650,175,.95,"M"],["Baleia","São Sebastião","SP",-23.776,-45.670,180,.85,"IM"],["Juquehy","São Sebastião","SP",-23.768,-45.733,180,.75,"I"],
["Praia Preta","São Sebastião","SP",-23.765,-45.745,170,.85,"M"],["Boracéia","São Sebastião","SP",-23.760,-45.840,180,.85,"IM"],
["Riviera de São Lourenço","Bertioga","SP",-23.790,-46.020,160,.85,"IM","","Melhor no canto direito."],["Enseada de Bertioga","Bertioga","SP",-23.820,-46.100,160,.75,"I"],
["Tijucopava","Guarujá","SP",-23.920,-46.150,120,.9,"M"],["Iporanga","Guarujá","SP",-23.930,-46.160,120,.95,"M","S","Acesso pelo condomínio, com limite diário de carros."],["São Pedro","Guarujá","SP",-23.945,-46.170,100,.9,"M"],
["Pernambuco","Guarujá","SP",-23.970,-46.190,120,.85,"IM"],["Enseada","Guarujá","SP",-23.990,-46.230,150,.7,"I"],["Pitangueiras","Guarujá","SP",-23.997,-46.257,150,.75,"I"],["Tombo","Guarujá","SP",-24.012,-46.271,145,1,"MA"],["Guaiúba","Guarujá","SP",-24.015,-46.285,160,.85,"M"],
["Quebra-Mar (Emissário)","Santos","SP",-23.975,-46.345,170,.7,"IM"],
["Itararé","São Vicente","SP",-23.978,-46.370,175,.65,"I"],
["Canto do Forte","Praia Grande","SP",-24.010,-46.400,160,.75,"IM"],["Guilhermina","Praia Grande","SP",-24.015,-46.420,165,.75,"IM"],["Vila Mirim","Praia Grande","SP",-24.035,-46.465,160,.75,"IM"],
["Plataforma de Pesca","Mongaguá","SP",-24.100,-46.620,150,.8,"IM","","Ondas ao lado do píer."],
["Praia dos Pescadores","Itanhaém","SP",-24.185,-46.780,165,.8,"IM"],["Praia dos Sonhos","Itanhaém","SP",-24.188,-46.785,160,.85,"IM"],
["Laje de Peruíbe","Peruíbe","SP",-24.340,-46.960,150,1.25,"A","B","Laje em mar aberto. Só para experientes."],["Guaraú","Peruíbe","SP",-24.375,-47.012,150,.95,"M"],["Arpoador de Peruíbe","Peruíbe","SP",-24.370,-47.000,160,.95,"M"],
["Ilha Comprida","Ilha Comprida","SP",-24.740,-47.540,125,.9,"IM"],
/* PR */
["Paralelas","Paranaguá","PR",-25.545,-48.300,110,.95,"M"],["Ilha do Mel (Praia Grande)","Paranaguá","PR",-25.555,-48.300,110,1,"M"],["Praia de Fora","Paranaguá","PR",-25.570,-48.315,140,.95,"M"],
["Pontal do Sul","Pontal do Paraná","PR",-25.580,-48.350,120,.85,"IM"],
["Riviera","Matinhos","PR",-25.770,-48.500,110,.85,"IM"],["Praia Brava de Matinhos","Matinhos","PR",-25.800,-48.520,110,.95,"M"],["Pico de Matinhos","Matinhos","PR",-25.820,-48.530,110,.95,"M","","Direitas perfeitas coladas nas pedras."],["Caiobá","Matinhos","PR",-25.850,-48.540,110,.85,"IM"],
["Caieiras","Guaratuba","PR",-25.860,-48.567,90,.85,"IM"],["Praia Brava de Guaratuba","Guaratuba","PR",-25.865,-48.560,100,.95,"M"],["Pico de Guaratuba","Guaratuba","PR",-25.875,-48.565,100,.95,"M"],
/* SC */
["Praia do Molhe","São Francisco do Sul","SC",-26.200,-48.490,80,.9,"M"],["Prainha","São Francisco do Sul","SC",-26.230,-48.500,90,.95,"M"],["Praia Grande","São Francisco do Sul","SC",-26.300,-48.530,90,.9,"IM"],
["Atalaia","Itajaí","SC",-26.910,-48.640,100,.9,"M","","Esquerda de rio clássica."],["Praia Brava","Itajaí","SC",-26.940,-48.630,90,.95,"M"],
["Praia dos Amores","Balneário Camboriú","SC",-26.960,-48.625,90,.85,"IM"],
["Mariscal","Bombinhas","SC",-27.130,-48.500,80,.85,"IM"],["Quatro Ilhas","Bombinhas","SC",-27.150,-48.480,80,.9,"M"],
["Praia Brava","Florianópolis","SC",-27.400,-48.410,70,.95,"M"],["Santinho","Florianópolis","SC",-27.460,-48.380,70,.95,"M"],["Moçambique","Florianópolis","SC",-27.530,-48.410,90,1,"M"],["Barra da Lagoa","Florianópolis","SC",-27.575,-48.420,90,.8,"I"],
["Praia Mole","Florianópolis","SC",-27.603,-48.432,90,.95,"M"],["Joaquina","Florianópolis","SC",-27.630,-48.450,110,1.05,"MA"],["Campeche","Florianópolis","SC",-27.670,-48.470,100,.95,"M","","Fica pesado e tubular em dias de vento sul."],
["Matadeiro","Florianópolis","SC",-27.755,-48.500,130,.9,"M"],["Naufragados","Florianópolis","SC",-27.830,-48.565,160,1,"MA","S","Extremo sul da ilha. Acesso por trilha longa ou barco."],
["Praia do Maço (Vale da Utopia)","Palhoça","SC",-27.880,-48.580,100,.95,"M"],["Guarda do Embaú","Palhoça","SC",-27.905,-48.590,100,1,"M","","Na foz do Rio da Madre."],
["Gamboa","Garopaba","SC",-27.940,-48.610,110,.9,"M"],["Siriú","Garopaba","SC",-27.990,-48.600,100,.95,"M"],["Silveira","Garopaba","SC",-28.030,-48.610,90,1.05,"MA","","Bancada de pedras lendária."],["Ferrugem","Garopaba","SC",-28.070,-48.620,120,.95,"M"],
["Praia do Rosa","Imbituba","SC",-28.130,-48.640,110,.95,"M","","Canto sul e canto norte."],["Ibiraquera","Imbituba","SC",-28.150,-48.630,110,.95,"M"],["Praia do Luz","Imbituba","SC",-28.165,-48.645,110,.9,"M"],
["Ribanceira","Imbituba","SC",-28.200,-48.660,120,.95,"M"],["Praia da Vila","Imbituba","SC",-28.235,-48.655,130,1.1,"MA"],
["Cigana","Laguna","SC",-28.470,-48.760,110,.9,"M"],["Ipoã","Laguna","SC",-28.520,-48.770,110,.9,"M"],["Galheta","Laguna","SC",-28.590,-48.800,120,.95,"M"],["Praia do Cardoso (Farol de Santa Marta)","Laguna","SC",-28.600,-48.810,130,1,"M"],
["Laje da Jagua","Jaguaruna","SC",-28.700,-48.880,120,1.5,"A","B","Montanha submarina a cerca de 5 km da costa que segura swells gigantes, chamada de Nazaré brasileira. Só tow-in, com equipe de resgate."],
/* RS */
["Molhes","Torres","RS",-29.325,-49.712,110,1,"M"],["Prainha","Torres","RS",-29.338,-49.720,100,.9,"M"],["Praia Cal","Torres","RS",-29.345,-49.722,100,.9,"M"],["Guarita","Torres","RS",-29.355,-49.725,100,.95,"M"],
["Capão da Canoa","Capão da Canoa","RS",-29.750,-50.000,110,.85,"IM"],["Plataforma de Atlântida","Xangri-lá","RS",-29.790,-50.040,110,.85,"IM"],
["Rio Tramandaí (Crenque)","Imbé","RS",-29.975,-50.130,100,.9,"M"],["Plataforma de Tramandaí","Tramandaí","RS",-29.985,-50.125,110,.85,"IM"],
["Plataforma de Cidreira","Cidreira","RS",-30.180,-50.200,110,.85,"IM"],["Cassino (Molhes da Barra)","Rio Grande","RS",-32.190,-52.160,120,.8,"IM"]
];

export const FICHA={
 "Itamambuca|Ubatuba":["Areia, pedras no canto","S, SE e L","O e NO (terral)","Meia maré enchendo","Palco de campeonatos. A foz do rio no canto costuma formar boas bancadas."],
 "Vermelha do Norte|Ubatuba":["Areia","S, SE e L","NO e N (terral)","Meia maré","Uma das mais consistentes de Ubatuba. Costuma ter onda quando o resto está pequeno."],
 "Praia Grande|Ubatuba":["Areia","SE e S","N e NO (terral)","Maré cheia","Ondas mais mansas e várias escolinhas. Boa para começar."],
 "Maresias|São Sebastião":["Areia","S e SSO","N e NE (terral)","Meia maré secando","Um dos picos mais conhecidos do Brasil. Com swell de sul fica pesado e tubular."],
 "Camburi|São Sebastião":["Areia","S e SE","N (terral)","Meia maré","Beach break com várias bancadas. Vale andar pela praia antes de cair."],
 "Juquehy|São Sebastião":["Areia","S","N (terral)","Maré cheia","Onda mais fraca. Boa para longboard e para quem está aprendendo."],
 "Bonete|Ilhabela":["Areia","S e SE","N (terral)","Meia maré","Acesso só por trilha ou barco. Recebe muita ondulação de sul."],
 "Tombo|Guarujá":["Areia","S e SE","NO e N (terral)","Meia maré","Pico tradicional do Guarujá, com onda forte e rápida."],
 "Pitangueiras|Guarujá":["Areia","S e SE","N (terral)","Maré cheia","Praia urbana com onda mais fraca. Boa para aulas."],
 "Itararé|São Vicente":["Areia","S","N (terral)","Maré cheia","Onda pequena na maior parte dos dias. Boa para aprender."],
 "Praia dos Sonhos|Itanhaém":["Areia e pedras","S e SE","N e NO (terral)","Meia maré","Praia pequena entre costões."],
 "Guaraú|Peruíbe":["Areia, pedras nos cantos","S e SE","N e NO (terral)","Meia maré","Cercada de mata. Fica melhor com terral de manhã."]
};

export const UFN={AP:"Amapá",PA:"Pará",MA:"Maranhão",PI:"Piauí",CE:"Ceará",RN:"Rio Grande do Norte",PB:"Paraíba",PE:"Pernambuco",AL:"Alagoas",SE:"Sergipe",BA:"Bahia",ES:"Espírito Santo",RJ:"Rio de Janeiro",SP:"São Paulo",PR:"Paraná",SC:"Santa Catarina",RS:"Rio Grande do Sul"};
export const NIVEL={I:"Iniciante",IM:"Iniciante a intermediário",M:"Intermediário",MA:"Intermediário a avançado",A:"Avançado"};
export const FLAG={S:["Isolado","Pico isolado. Acesso difícil: respeito total aos locais e à natureza."],B:["Ondas grandes","Laje de ondas grandes em bancada de pedra. Só para surfistas experientes, com equipe de segurança."],T:["Risco de tubarão","Fica na área de risco de tubarão monitorada pelo estado. Confira as regras locais antes de cair."]};
export function slug(s){return s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
export const PICOS=RAW.map(r=>{
  const [nome,cidade,uf,lat,lon,face,fator,nv,flags="",dica=""]=r;
  return{nome,cidade,uf,lat,lon,face,fator,nivel:NIVEL[nv],flags,dica,poro:flags.includes("P"),ficha:FICHA[nome+"|"+cidade]||null,
    ufSlug:uf.toLowerCase(),cidadeSlug:slug(cidade),slug:slug(nome),id:slug(nome+"-"+cidade)};
});
